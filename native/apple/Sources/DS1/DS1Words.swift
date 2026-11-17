import Foundation
import SwiftUI

@MainActor
public final class DS1Words: ObservableObject {
    public static let shared = DS1Words()

    @Published public var language: DS1Language
    @Published public var languages: [DS1Language] = DS1Language.allCases
    @Published private var productWords: [String: [String: String]] = [:]

    init() {
        language = Locale.preferredLanguages.lazy.compactMap { DS1Words.normalize($0) }.first ?? .en
    }

    public func register(_ words: [String: [String: String]]) {
        for (code, table) in words { productWords[code, default: [:]].merge(table) { _, new in new } }
    }

    public func text(_ key: String, _ params: [String: CustomStringConvertible] = [:], language: DS1Language? = nil) -> String {
        let language = language ?? self.language
        var order = [language.code, String(language.code.split(separator: "-").first ?? "")] + language.related + ["en"]
        order = order.reduce(into: []) { if !$0.contains($1) { $0.append($1) } }
        let found = order.lazy.compactMap { self.productWords[$0]?[key] ?? DS1SharedWords.tables[$0]?[key] }.first
        return DS1Words.fill(found ?? key, params)
    }

    public nonisolated static func fill(_ text: String, _ params: [String: CustomStringConvertible]) -> String {
        guard !params.isEmpty else { return text }
        let pattern = try! NSRegularExpression(pattern: #"\{\{?\s*([\w.-]+)\s*\}?\}"#)
        var result = text
        for match in pattern.matches(in: text, range: NSRange(text.startIndex..., in: text)).reversed() {
            guard let whole = Range(match.range, in: text), let name = Range(match.range(at: 1), in: text),
                  let value = params[String(text[name])] else { continue }
            result.replaceSubrange(whole, with: value.description)
        }
        return result
    }

    public nonisolated static func normalize(_ tag: String, allowed: [DS1Language] = DS1Language.allCases) -> DS1Language? {
        let normal = tag.trimmingCharacters(in: .whitespaces).lowercased().replacingOccurrences(of: "_", with: "-")
        let primary = String(normal.split(separator: "-").first ?? "")
        guard let member = DS1Language.allCases.first(where: { $0.code.lowercased() == normal || $0.aliases.contains(normal) })
            ?? DS1Language.allCases.first(where: { $0.code.lowercased() == primary }) else { return nil }
        if allowed.contains(member) { return member }
        return member.related.lazy.compactMap { code in allowed.first { $0.code == code } }.first
    }

    public func next() -> DS1Language {
        guard let i = languages.firstIndex(of: language) else { return languages.first ?? .en }
        return languages[(i + 1) % languages.count]
    }
}

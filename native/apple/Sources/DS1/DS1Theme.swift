import SwiftUI

public enum DS1ThemeMode: String, CaseIterable, Sendable {
    case light, dark, system

    @MainActor public var label: String { DS1Words.shared.text(rawValue.prefix(1).uppercased() + rawValue.dropFirst()) }

    public var colorScheme: ColorScheme? {
        switch self {
        case .light: .light
        case .dark: .dark
        case .system: nil
        }
    }

    public var next: DS1ThemeMode { DS1ThemeMode.allCases[(DS1ThemeMode.allCases.firstIndex(of: self)! + 1) % 3] }
}

@MainActor
public final class DS1Preferences: ObservableObject {
    public static let shared = DS1Preferences()
    private let defaults = UserDefaults.standard
    private static let themeKey = "ds-one:theme"
    private static let languageKey = "ds-one:language"

    @Published public private(set) var theme: DS1ThemeMode

    init() {
        theme = DS1ThemeMode(rawValue: UserDefaults.standard.string(forKey: Self.themeKey) ?? "") ?? .system
        if let saved = UserDefaults.standard.string(forKey: Self.languageKey), let language = DS1Words.normalize(saved) {
            DS1Words.shared.language = language
        }
    }

    public func saveTheme(_ mode: DS1ThemeMode) {
        theme = mode
        defaults.set(mode.rawValue, forKey: Self.themeKey)
    }

    public func saveLanguage(_ language: DS1Language) {
        DS1Words.shared.language = language
        defaults.set(language.code, forKey: Self.languageKey)
    }
}

private struct DS1Themed: ViewModifier {
    @ObservedObject private var preferences = DS1Preferences.shared
    @ObservedObject private var words = DS1Words.shared
    let corner: CGFloat
    let toasts: Bool
    let dialogs: Bool

    func body(content: Content) -> some View {
        content
            .overlay {
                #if canImport(UIKit)
                DS1PresentationLayer(toasts: toasts, confirmations: dialogs)
                #else
                ZStack { if toasts { DS1ToastHost() }; if dialogs { DS1OverlayHost() } }
                #endif
            }
            .ds1Scaled(corner: corner)
            .preferredColorScheme(preferences.theme.colorScheme)
            .environment(\.locale, Locale(identifier: words.language.code))
    }
}

extension View {
    public func ds1Theme(corner: CGFloat = DS1Metrics.radius, toasts: Bool = true, dialogs: Bool = true) -> some View {
        modifier(DS1Themed(corner: corner, toasts: toasts, dialogs: dialogs))
    }
}

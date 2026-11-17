import SwiftUI
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

public struct DS1Color: ShapeStyle, Hashable, Sendable {
    public let light: UInt32
    public let dark: UInt32
    public let lightOpacity: Double
    public let darkOpacity: Double

    public init(light: UInt32, dark: UInt32, lightOpacity: Double = 1, darkOpacity: Double = 1) {
        self.light = light
        self.dark = dark
        self.lightOpacity = lightOpacity
        self.darkOpacity = darkOpacity
    }

    public init(_ value: UInt32, opacity: Double = 1) {
        self.init(light: value, dark: value, lightOpacity: opacity, darkOpacity: opacity)
    }

    public func value(dark isDark: Bool) -> (red: Double, green: Double, blue: Double, opacity: Double) {
        let v = isDark ? dark : light
        return (Double((v >> 16) & 0xff) / 255, Double((v >> 8) & 0xff) / 255, Double(v & 0xff) / 255, isDark ? darkOpacity : lightOpacity)
    }

    public func resolve(in environment: EnvironmentValues) -> Color.Resolved {
        let v = value(dark: environment.colorScheme == .dark)
        return Color.Resolved(colorSpace: .sRGB, red: Float(v.red), green: Float(v.green), blue: Float(v.blue), opacity: Float(v.opacity))
    }

    public func withOpacity(_ opacity: Double) -> DS1Color {
        DS1Color(light: light, dark: dark, lightOpacity: lightOpacity * opacity, darkOpacity: darkOpacity * opacity)
    }

    #if canImport(UIKit)
    public var uiColor: UIColor {
        UIColor { traits in
            let v = value(dark: traits.userInterfaceStyle == .dark)
            return UIColor(red: v.red, green: v.green, blue: v.blue, alpha: v.opacity)
        }
    }
    public var color: Color { Color(uiColor: uiColor) }
    #elseif canImport(AppKit)
    public var nsColor: NSColor {
        NSColor(name: nil) { appearance in
            let v = value(dark: appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua)
            return NSColor(srgbRed: v.red, green: v.green, blue: v.blue, alpha: v.opacity)
        }
    }
    public var color: Color { Color(nsColor: nsColor) }
    #endif
}

public struct DS1PaletteEntry: Hashable, Sendable {
    public let name: String
    public let colour: DS1Color
    public let pastelName: String
    public let pastel: DS1Color
    public let ink: Bool
}

private struct DS1PaperKey: EnvironmentKey {
    static let defaultValue = DS1Color.paper
}

extension EnvironmentValues {
    public var ds1Paper: DS1Color {
        get { self[DS1PaperKey.self] }
        set { self[DS1PaperKey.self] = newValue }
    }
}

extension View {
    public func ds1Paper(_ paper: DS1Color) -> some View {
        environment(\.ds1Paper, paper)
    }
}

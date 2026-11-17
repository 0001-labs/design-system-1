import SwiftUI

public struct DS1ButtonStyle: ButtonStyle {
    public enum Kind: Sendable { case plain, secondary, primary }

    let kind: Kind
    let icon: Bool
    public init(_ kind: Kind = .plain) { self.kind = kind; self.icon = false }
    init(_ kind: Kind, icon: Bool) { self.kind = kind; self.icon = icon }

    public func makeBody(configuration: Configuration) -> some View {
        Face(configuration: configuration, kind: kind, icon: icon)
    }

    struct Face: View {
        @Environment(\.ds1Scale) private var scale
        @Environment(\.isEnabled) private var enabled
        let configuration: Configuration
        let kind: Kind
        let icon: Bool

        var body: some View {
            configuration.label
                .environment(\.ds1ButtonFilled, kind != .plain)
                .font(DS1Font.font(.regular, size: scale.type))
                .tracking(scale.tracking)
                .lineLimit(1)
                .foregroundStyle(kind == .primary ? DS1Color.onAccent : DS1Color.text)
                .padding(.horizontal, kind == .plain ? 0 : scale(4))
                .frame(height: scale.control)
                .background(background, in: RoundedRectangle(cornerRadius: scale.radius, style: .continuous))
                .frame(height: scale.unit, alignment: icon ? .top : .bottom)
                .contentShape(Rectangle())
                .opacity(!enabled ? 0.5 : configuration.isPressed ? 0.7 : 1)
        }

        private var background: DS1Color {
            switch kind {
            case .plain: DS1Color(0x000000, opacity: 0)
            case .secondary: .fill
            case .primary: .accent
            }
        }
    }
}

public struct DS1ButtonLabel: View {
    public enum Side: Sendable { case leading, trailing }

    @Environment(\.ds1Scale) private var scale
    @Environment(\.ds1ButtonFilled) private var filled
    let text: String
    let icon: DS1IconName
    let side: Side

    public init(_ text: String, icon: DS1IconName, side: Side = .trailing) {
        self.text = text; self.icon = icon; self.side = side
    }

    public var body: some View {
        HStack(spacing: 0) {
            if side == .leading { glyph }
            Text(text)
            if side == .trailing { glyph }
        }
    }

    private var glyph: some View {
        DS1Icon(icon, size: .large)
            .padding(side == .trailing ? .trailing : .leading, filled ? -scale(4) : 0)
    }
}

private struct DS1ButtonFilledKey: EnvironmentKey {
    static let defaultValue = false
}

extension EnvironmentValues {
    var ds1ButtonFilled: Bool {
        get { self[DS1ButtonFilledKey.self] }
        set { self[DS1ButtonFilledKey.self] = newValue }
    }
}

extension ButtonStyle where Self == DS1ButtonStyle {
    public static var ds1: DS1ButtonStyle { DS1ButtonStyle() }
    public static func ds1(_ kind: DS1ButtonStyle.Kind) -> DS1ButtonStyle { DS1ButtonStyle(kind) }
}

public struct DS1IconButton: View {
    let icon: DS1IconName
    let label: String
    let kind: DS1ButtonStyle.Kind
    let action: () -> Void
    public init(_ icon: DS1IconName, label: String, kind: DS1ButtonStyle.Kind = .plain, action: @escaping () -> Void) {
        self.icon = icon; self.label = label; self.kind = kind; self.action = action
    }
    public var body: some View {
        Button(action: action) {
            DS1Icon(icon)
                .foregroundStyle(kind == .plain ? DS1Color.textMuted : kind == .primary ? DS1Color.onAccent : DS1Color.text)
                .frame(width: DS1Metrics.control)
        }
        .buttonStyle(DS1ButtonStyle(kind, icon: true))
        .accessibilityLabel(label)
    }
}

public struct DS1DangerButton: View {
    let label: String
    let action: () -> Void
    public init(_ label: String, action: @escaping () -> Void) { self.label = label; self.action = action }
    public var body: some View {
        Button(action: action) { DS1ControlText(label, colour: .danger) }.buttonStyle(.ds1(.secondary))
    }
}

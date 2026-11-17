import SwiftUI

public struct DS1Option<Value: Hashable>: Identifiable {
    public let value: Value
    public let label: String
    public let swatch: Color?
    public let enabled: Bool
    public var id: Value { value }
    public init(_ value: Value, _ label: String, swatch: Color? = nil, enabled: Bool = true) {
        self.value = value; self.label = label; self.swatch = swatch; self.enabled = enabled
    }
}

public struct DS1Select<Value: Hashable>: View {
    @Environment(\.ds1Scale) private var scale
    let options: [DS1Option<Value>]
    @Binding var selection: Value
    let label: String?
    let chip: Bool
    let primary: Bool
    let fit: Bool

    public init(_ options: [DS1Option<Value>], selection: Binding<Value>, label: String? = nil, chip: Bool = false, primary: Bool = false, fit: Bool = false) {
        self.options = options; _selection = selection; self.label = label; self.chip = chip; self.primary = primary; self.fit = fit
    }

    public var body: some View {
        let current = options.first { $0.value == selection }
        let ink: DS1Color = chip && primary ? .onAccent : chip ? .text : .inputText
        Menu {
            Picker(label ?? "", selection: $selection) {
                ForEach(options) { option in Text(option.label).tag(option.value) }
            }
            .pickerStyle(.inline)
        } label: {
            HStack(spacing: scale(4)) {
                if let swatch = current?.swatch { DS1Swatch(swatch) }
                DS1ControlText(current?.label ?? "", colour: ink).frame(maxWidth: fit || chip ? nil : .infinity, alignment: .leading)
                DS1Icon(.down, size: .large).foregroundStyle(ink)
            }
            .padding(.leading, scale(4))
            .padding(.trailing, scale(2))
            .frame(width: fit || chip ? nil : scale.squares(8), height: chip ? scale.control : scale.unit)
            .background(chip && primary ? DS1Color.accent : chip ? DS1Color.fill : DS1Color.inputBackground, in: RoundedRectangle(cornerRadius: scale.radius, style: .continuous))
            .overlay { if !chip { RoundedRectangle(cornerRadius: scale.radius, style: .continuous).strokeBorder(DS1Color.border, lineWidth: DS1Metrics.line) } }
        }
        .menuStyle(.button)
        .buttonStyle(.plain)
        .menuIndicator(.hidden)
        .fixedSize()
        .accessibilityLabel(label ?? current?.label ?? "")
        .accessibilityValue(current?.label ?? "")
    }
}

public struct DS1MenuItem: View {
    @Environment(\.ds1Scale) private var scale
    let label: String
    let icon: DS1IconName?
    let selected: Bool?
    let danger: Bool
    let action: () -> Void
    public init(_ label: String, icon: DS1IconName? = nil, selected: Bool? = nil, danger: Bool = false, action: @escaping () -> Void) {
        self.label = label; self.icon = icon; self.selected = selected; self.danger = danger; self.action = action
    }
    public var body: some View {
        Button(action: action) {
            HStack(spacing: scale(4)) {
                if let icon { DS1Icon(icon).foregroundStyle(danger ? DS1Color.danger : DS1Color.text) }
                DS1ControlText(label, colour: danger ? .danger : .text).frame(maxWidth: .infinity, alignment: .leading)
                if selected == true { DS1Icon(.check) }
            }
            .padding(.horizontal, scale(4))
            .frame(height: scale.unit)
            .contentShape(Rectangle())
        }
        .buttonStyle(DS1MenuItemStyle())
        .accessibilityAddTraits(selected == true ? [.isButton, .isSelected] : .isButton)
    }
}

struct DS1MenuItemStyle: ButtonStyle {
    @Environment(\.ds1Scale) private var scale
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.background(configuration.isPressed ? DS1Color.fill : DS1Color(0, opacity: 0), in: RoundedRectangle(cornerRadius: scale.radius, style: .continuous))
    }
}

public struct DS1Menu<Content: View>: View {
    @Environment(\.ds1Paper) private var paper
    @Environment(\.ds1Scale) private var scale
    let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        ScrollView { VStack(spacing: 0) { content } }
            .padding(scale(4))
            .frame(minWidth: scale.squares(8), maxHeight: scale.squares(16))
            .fixedSize(horizontal: false, vertical: true)
            .background(paper, in: RoundedRectangle(cornerRadius: scale.radius, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: scale.radius, style: .continuous).strokeBorder(DS1Color.border, lineWidth: DS1Metrics.line))
    }
}

public struct DS1MenuLabel: View {
    @Environment(\.ds1Scale) private var scale
    let label: String
    public init(_ label: String) { self.label = label }
    public var body: some View { DS1ControlText(label, colour: .textMuted).padding(.horizontal, scale(4)).frame(maxWidth: .infinity, minHeight: scale.unit, alignment: .leading) }
}

public struct DS1MenuSeparator: View {
    @Environment(\.ds1Scale) private var scale
    public init() {}
    public var body: some View { DS1Rule().padding(.vertical, scale.half) }
}

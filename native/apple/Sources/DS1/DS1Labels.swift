import SwiftUI

struct DS1ControlText: View {
    @Environment(\.ds1Scale) private var scale
    let string: String
    let colour: DS1Color
    let face: DS1Font.Face
    init(_ string: String, colour: DS1Color, face: DS1Font.Face = .regular) { self.string = string; self.colour = colour; self.face = face }
    var body: some View {
        Text(DS1Font.attributed(string.replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression), scale: scale, face: face))
            .foregroundStyle(colour)
            .lineLimit(1)
            .fixedSize(horizontal: true, vertical: true)
    }
}

public struct DS1Badge: View {
    @Environment(\.ds1Scale) private var scale
    let label: String
    let icon: DS1IconName?
    let iconOnly: Bool
    let background: DS1Color
    let ink: DS1Color

    public init(_ label: String, icon: DS1IconName? = nil, iconOnly: Bool = false, background: DS1Color = .fill, ink: DS1Color = .text) {
        self.label = label; self.icon = icon; self.iconOnly = iconOnly; self.background = background; self.ink = ink
    }

    public var body: some View {
        WholeSquares(unit: scale.unit) {
            HStack(spacing: scale(4)) {
                if let icon { DS1Icon(icon).foregroundStyle(ink) }
                if !iconOnly { DS1ControlText(label, colour: ink) }
            }
            .padding(.horizontal, iconOnly ? 0 : scale(4))
        }
        .frame(height: scale.unit)
        .frame(minWidth: scale.unit)
        .background(background)
        .fixedSize(horizontal: true, vertical: true)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label)
    }
}

struct WholeSquares: Layout {
    let unit: CGFloat
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let size = subviews.first?.sizeThatFits(.unspecified) ?? .zero
        let width = max(unit, (size.width / unit).rounded(.up) * unit)
        return CGSize(width: proposal.width.map { min($0, width) } ?? width, height: size.height)
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            view.place(at: CGPoint(x: bounds.minX, y: bounds.midY - size.height / 2), proposal: ProposedViewSize(width: min(size.width, bounds.width), height: size.height))
        }
    }
}

public struct DS1Token<Leading: View>: View {
    @Environment(\.ds1Scale) private var scale
    let label: String
    let detail: String?
    let removeLabel: String?
    let onRemove: (() -> Void)?
    let leading: Leading

    public init(_ label: String, detail: String? = nil, removeLabel: String? = nil, onRemove: (() -> Void)? = nil, @ViewBuilder leading: () -> Leading) {
        self.label = label; self.detail = detail; self.removeLabel = removeLabel; self.onRemove = onRemove; self.leading = leading()
    }

    public var body: some View {
        HStack(spacing: scale(4)) {
            leading
            DS1ControlText(label, colour: .text)
            if let detail { DS1LineText(detail, style: .small, tone: .muted) }
            if let removeLabel, let onRemove {
                Button(action: onRemove) { DS1Icon(.close).frame(width: scale.unit, height: scale.unit) }
                    .buttonStyle(.plain)
                    .accessibilityLabel(removeLabel)
            }
        }
        .padding(.leading, scale(4))
        .padding(.trailing, removeLabel == nil ? scale(4) : 0)
        .frame(height: scale.unit)
        .background(DS1Color.fill, in: RoundedRectangle(cornerRadius: scale.radius, style: .continuous))
        .fixedSize(horizontal: true, vertical: true)
    }
}

extension DS1Token where Leading == EmptyView {
    public init(_ label: String, detail: String? = nil, removeLabel: String? = nil, onRemove: (() -> Void)? = nil) {
        self.init(label, detail: detail, removeLabel: removeLabel, onRemove: onRemove) { EmptyView() }
    }
}

public struct DS1Swatch: View {
    @Environment(\.ds1Scale) private var scale
    let colour: Color
    let selected: Bool
    public init(_ colour: Color, selected: Bool = false) { self.colour = colour; self.selected = selected }
    public var body: some View {
        Rectangle().fill(colour)
            .overlay(Rectangle().strokeBorder(DS1Color.border, lineWidth: DS1Metrics.line))
            .frame(width: scale.control, height: scale.control)
            .padding(selected ? 2 : 0)
            .overlay { if selected { Rectangle().strokeBorder(DS1Color.text, lineWidth: 2) } }
            .padding(selected ? -2 : 0)
            .accessibilityHidden(true)
    }
}

public struct DS1Link: View {
    @Environment(\.ds1Scale) private var scale
    let label: String
    let ink: DS1Color
    let action: () -> Void
    public init(_ label: String, ink: DS1Color = .text, action: @escaping () -> Void) { self.label = label; self.ink = ink; self.action = action }
    public var body: some View {
        Button(action: action) {
            DS1ControlText(label, colour: ink)
                .overlay(alignment: .bottom) { Rectangle().fill(ink.withOpacity(0.4)).frame(height: DS1Metrics.line).offset(y: scale(2)) }
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(.isLink)
    }
}

public enum DS1GapSize: CGFloat, Sendable { case tenth = 0.1, quarter = 0.25, half = 0.5, eightTenths = 0.8, unit = 1, double = 2, triple = 3, quad = 4, oct = 8, dozen = 12 }

public struct DS1Gap: View {
    @Environment(\.ds1Scale) private var scale
    let size: DS1GapSize
    public init(_ size: DS1GapSize = .unit) { self.size = size }
    public var body: some View { Color.clear.frame(maxWidth: .infinity).frame(height: scale.squares(size.rawValue)).accessibilityHidden(true) }
}

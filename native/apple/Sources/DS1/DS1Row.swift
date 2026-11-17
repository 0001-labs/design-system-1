import SwiftUI

public struct DS1Row<Content: View>: View {
    @Environment(\.ds1Scale) private var scale
    let rule: Bool
    let spacing: CGFloat?
    let content: Content

    public init(rule: Bool = false, spacing: CGFloat? = nil, @ViewBuilder content: () -> Content) {
        self.rule = rule
        self.spacing = spacing
        self.content = content()
    }

    public var body: some View {
        HStack(alignment: .bottom, spacing: spacing ?? scale(4)) { content }
            .padding(.bottom, rule ? DS1Metrics.line : 0)
            .frame(maxWidth: .infinity, minHeight: scale.unit, maxHeight: scale.unit, alignment: .bottomLeading)
            .overlay(alignment: .bottom) { if rule { DS1Rule() } }
    }
}

public struct DS1Rule: View {
    let colour: DS1Color
    public init(_ colour: DS1Color = .border) { self.colour = colour }
    public var body: some View {
        Rectangle().fill(colour).frame(height: DS1Metrics.line).accessibilityHidden(true)
    }
}

import SwiftUI

public enum DS1PageLayoutKind: Sendable { case sidebar, split, inspector, column, centered, tiles }

public struct DS1PageLayout<Nav: View, Main: View, Aside: View>: View {
    @Environment(\.ds1Paper) private var paper
    @Environment(\.ds1Scale) private var scale
    let kind: DS1PageLayoutKind
    let measure: CGFloat?
    let divided: Bool
    let nav: Nav
    let main: Main
    let aside: Aside

    public init(_ kind: DS1PageLayoutKind, measure: CGFloat? = nil, divided: Bool = false, @ViewBuilder nav: () -> Nav, @ViewBuilder main: () -> Main, @ViewBuilder aside: () -> Aside) {
        self.kind = kind; self.measure = measure; self.divided = divided; self.nav = nav(); self.main = main(); self.aside = aside()
    }

    public var body: some View {
        GeometryReader { g in
            let room = g.size.width - 2 * scale.unit
            let narrow = room < scale.squares(30)
            Group {
                if narrow || kind == .column || kind == .centered || kind == .tiles {
                    let width = narrow || kind == .tiles ? room : min(scale.squares(measure ?? (kind == .centered ? 16 : 32)), scale.wholeSquares(in: room))
                    ScrollView {
                        VStack(alignment: .leading, spacing: scale.unit) { nav; main; aside }
                            .frame(width: width, alignment: .leading)
                            .frame(maxWidth: .infinity, minHeight: kind == .centered && !narrow ? g.size.height - 2 * scale.unit : nil)
                    }
                } else {
                    HStack(alignment: .top, spacing: scale.squares(2)) {
                        ScrollView { nav }.frame(width: scale.squares(kind == .split ? 16 : 12)).overlay(alignment: .trailing) { if divided { line } }
                        ScrollView { main.frame(maxWidth: .infinity, alignment: .leading) }
                            .overlay(alignment: .trailing) { if divided && kind == .inspector { line } }
                        if kind == .inspector { ScrollView { aside }.frame(width: scale.squares(12)) }
                    }
                }
            }
            .padding(scale.unit)
        }
        .background(paper)
    }

    private var line: some View { Rectangle().fill(DS1Color.border).frame(width: DS1Metrics.line).offset(x: scale.unit) }
}

extension DS1PageLayout where Aside == EmptyView {
    public init(_ kind: DS1PageLayoutKind, measure: CGFloat? = nil, divided: Bool = false, @ViewBuilder nav: () -> Nav, @ViewBuilder main: () -> Main) {
        self.init(kind, measure: measure, divided: divided, nav: nav, main: main) { EmptyView() }
    }
}

extension DS1PageLayout where Nav == EmptyView, Aside == EmptyView {
    public init(_ kind: DS1PageLayoutKind, measure: CGFloat? = nil, @ViewBuilder main: () -> Main) {
        self.init(kind, measure: measure, divided: false, nav: { EmptyView() }, main: main) { EmptyView() }
    }
}

public enum DS1TileSpan: Sendable { case one, wide, full }

public struct DS1Tiles<Content: View>: View {
    @Environment(\.ds1Scale) private var scale
    let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View { DS1Flow(spacing: scale.unit) { content } }
}

extension View {
    public func ds1Tile(_ span: DS1TileSpan = .one) -> some View { modifier(DS1TileWidth(span: span)) }
}

private struct DS1TileWidth: ViewModifier {
    @Environment(\.ds1Scale) private var scale
    let span: DS1TileSpan
    func body(content: Content) -> some View {
        switch span {
        case .one: content.frame(width: scale.squares(12), alignment: .topLeading)
        case .wide: content.frame(width: scale.squares(25), alignment: .topLeading)
        case .full: content.frame(maxWidth: .infinity, alignment: .topLeading)
        }
    }
}

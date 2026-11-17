import CoreText
import SwiftUI

public enum DS1TextStyle: Sendable {
    case text, small, heading, display

    func size(_ scale: DS1Scale) -> CGFloat {
        switch self {
        case .text: scale.type
        case .small: scale.small
        case .heading: scale.heading
        case .display: scale.display
        }
    }
    func tracking(_ scale: DS1Scale) -> CGFloat { self == .display ? scale.displayTracking : scale.tracking }
    func line(_ scale: DS1Scale) -> CGFloat { self == .display ? 2 * scale.unit : scale.unit }
}

public enum DS1Tone: Sendable {
    case text, muted, title, danger

    public var colour: DS1Color {
        switch self {
        case .text: .text
        case .muted: .textMuted
        case .title: .title
        case .danger: .danger
        }
    }
}

extension DS1Font {
    public static func attributed(_ string: String, style: DS1TextStyle = .text, scale: DS1Scale, face: Face = .regular, figures: Bool = false, cells: Bool = true) -> AttributedString {
        attributed(string, size: style.size(scale), tracking: style.tracking(scale), face: face, figures: figures, cells: cells)
    }

    public static func attributed(_ string: String, size: CGFloat, tracking: CGFloat, face: Face = .regular, figures: Bool = false, cells: Bool = true) -> AttributedString {
        let text = font(face, size: size)
        let arrow = font(.arrows, size: size)
        let figureSize = size * figureScale
        let figure = font(.figures, size: figureSize)
        let figureFont = ctFont(.figures, size: figureSize)
        let cell = advance(of: "0", in: figureFont)

        enum Kind { case text, arrow, figure, digit }
        var pieces: [(Character, Kind, CGFloat)] = string.map { character in
            let scalar = character.unicodeScalars.count == 1 ? character.unicodeScalars.first : nil
            if let scalar, arrowCharacters.contains(scalar) { return (character, .arrow, tracking) }
            if figures, let scalar, figureCharacters.contains(scalar) {
                return (character, cells && CharacterSet.decimalDigits.contains(scalar) ? .digit : .figure, tracking)
            }
            return (character, .text, tracking)
        }
        for i in pieces.indices where pieces[i].1 == .digit {
            let spare = max(0, cell - advance(of: pieces[i].0, in: figureFont)) / 2
            pieces[i].2 = spare
            if i > 0 { pieces[i - 1].2 += spare }
        }
        var result = AttributedString()
        for (character, kind, kern) in pieces {
            var piece = AttributedString(String(character))
            piece.font = kind == .text ? text : kind == .arrow ? arrow : figure
            piece.kern = kern
            result += piece
        }
        return result
    }

    public static var figureScale: CGFloat {
        guard isAvailable(.figures), isAvailable(.regular) else { return 1 }
        let gt = ctFont(.regular, size: 100), dots = ctFont(.figures, size: 100)
        let utf16 = Array("0".utf16)
        var glyph: [CGGlyph] = [0]
        guard CTFontGetGlyphsForCharacters(dots, utf16, &glyph, 1) else { return 1 }
        var box = CGRect.zero
        CTFontGetBoundingRectsForGlyphs(dots, .horizontal, glyph, &box, 1)
        return box.maxY > 0 ? CTFontGetCapHeight(gt) / box.maxY : 1
    }

    public static func baseline(size: CGFloat, line: CGFloat) -> CGFloat {
        let gt = ctFont(.regular, size: size)
        let ascent = CTFontGetAscent(gt), descent = CTFontGetDescent(gt)
        return (line - ascent - descent) / 2 + ascent
    }

    public static func capBaseline(size: CGFloat, line: CGFloat) -> CGFloat {
        (line + CTFontGetCapHeight(ctFont(.regular, size: size))) / 2
    }

    public static func lineHeight(_ face: Face, size: CGFloat) -> CGFloat {
        let font = ctFont(face, size: size)
        return CTFontGetAscent(font) + CTFontGetDescent(font) + CTFontGetLeading(font)
    }

    static func advance(of character: Character, in font: CTFont) -> CGFloat {
        let utf16 = Array(String(character).utf16)
        var glyphs = [CGGlyph](repeating: 0, count: utf16.count)
        guard CTFontGetGlyphsForCharacters(font, utf16, &glyphs, utf16.count) else { return 0 }
        return CGFloat(CTFontGetAdvancesForGlyphs(font, .horizontal, glyphs, nil, glyphs.count))
    }
}

public struct DS1LineText: View {
    @Environment(\.ds1Scale) private var scale
    @Environment(\.multilineTextAlignment) private var textAlignment
    let string: String
    let style: DS1TextStyle
    let tone: DS1Tone
    let strong: Bool
    let figures: Bool
    let cells: Bool
    let wrap: Bool
    let fillWidth: Bool

    public init(_ string: String, style: DS1TextStyle = .text, tone: DS1Tone = .text, strong: Bool = false, figures: Bool = false, cells: Bool = true, wrap: Bool = false, fillWidth: Bool = true) {
        self.string = string
        self.style = style
        self.tone = tone
        self.strong = strong
        self.figures = figures
        self.cells = cells
        self.wrap = wrap
        self.fillWidth = fillWidth
    }

    private var alignment: HorizontalAlignment {
        switch textAlignment {
        case .center: .center
        case .trailing: .trailing
        default: .leading
        }
    }

    public var body: some View {
        let face: DS1Font.Face = strong || style == .heading ? .medium : .regular
        let line = style.line(scale)
        let text = Text(DS1Font.attributed(string, style: style, scale: scale, face: face, figures: figures, cells: cells))
            .foregroundStyle(tone.colour)
            .accessibilityLabel(string)
        if wrap {
            let glyphs = DS1Font.lineHeight(face, size: style.size(scale))
            let laid = glyphs.rounded(.up)
            let above = max(0, line - glyphs) / 2
            text
                .lineSpacing(max(0, line - laid))
                .padding(.top, above)
                .padding(.bottom, max(0, line - laid - above))
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: fillWidth ? .infinity : nil, minHeight: line, alignment: Alignment(horizontal: alignment, vertical: .center))
        } else {
            text
                .lineLimit(1)
                .truncationMode(.tail)
                .ds1Baseline(style)
        }
    }
}

public struct DS1Figures: View {
    @Environment(\.ds1Scale) private var scale
    let string: String
    let style: DS1TextStyle
    let tone: DS1Tone

    public init(_ string: String, style: DS1TextStyle = .text, tone: DS1Tone = .text) {
        self.string = string
        self.style = style
        self.tone = tone
    }

    public var body: some View {
        DS1LineText(string, style: style, tone: tone, figures: true)
            .fixedSize(horizontal: true, vertical: false)
            .layoutPriority(1)
    }
}


extension View {
    public func ds1Baseline(_ style: DS1TextStyle = .text) -> some View {
        modifier(DS1Baseline(style: style))
    }
}

private struct DS1Baseline: ViewModifier {
    @Environment(\.ds1Scale) private var scale
    let style: DS1TextStyle
    func body(content: Content) -> some View {
        let line = style.line(scale)
        let baseline = style == .display ? line : line - scale.leading + DS1Font.capBaseline(size: style.size(scale), line: scale.leading)
        content
            .alignmentGuide(VerticalAlignment.top) { d in d[.firstTextBaseline] - baseline }
            .frame(height: line, alignment: .top)
    }
}

import SwiftUI

/// `ds-tag`: a label that always hugs its complete words, one control high on the lower sixteen.
/// The default tint follows ds-tag.css. A capsule and explicit surfaces compose neutral source marks.
public struct DS1Tag<Leading: View>: View {
    @Environment(\.ds1Scale) private var scale
    let label: String
    let accent: DS1Color?
    let background: DS1Color?
    let ink: DS1Color?
    let border: DS1Color?
    let capsule: Bool
    let leading: Leading
    public init(_ label: String, accent: DS1Color? = nil, background: DS1Color? = nil, ink: DS1Color? = nil,
                border: DS1Color? = nil, capsule: Bool = false, @ViewBuilder leading: () -> Leading) {
        self.label=label;self.accent=accent;self.background=background;self.ink=ink;self.border=border;self.capsule=capsule;self.leading=leading()
    }
    public var body: some View {
        let colours=DS1TagColours(accent:accent),radius=capsule ? scale.control / 2 : scale.radius
        HStack(spacing:scale.half) {
            leading
            DS1ControlText(label,colour:ink ?? colours.ink)
        }
        .padding(.horizontal,capsule ? scale.half : scale(4))
        .frame(height:scale.control)
        .background(background ?? colours.background,in:RoundedRectangle(cornerRadius:radius,style:.continuous))
        .overlay(RoundedRectangle(cornerRadius:radius,style:.continuous).strokeBorder(border ?? .text.withOpacity(0),lineWidth:DS1Metrics.line))
        .frame(height:scale.unit,alignment:.bottom)
        .fixedSize(horizontal:true,vertical:true)
        .accessibilityElement(children:.ignore).accessibilityLabel(label)
    }
}
extension DS1Tag where Leading == EmptyView {
    public init(_ label: String, accent: DS1Color? = nil, background: DS1Color? = nil, ink: DS1Color? = nil, border: DS1Color? = nil, capsule: Bool = false) {
        self.init(label,accent:accent,background:background,ink:ink,border:border,capsule:capsule) { EmptyView() }
    }
}

/// The actual CSS uses srgb colour mixes; premultiplied alpha preserves translucent custom accents.
struct DS1TagColours {
    let background: DS1Color
    let ink: DS1Color
    init(accent: DS1Color?) {
        let accent=accent ?? DS1Color(DS1Color.darkerGrey.light)
        let fillLight=Self.mix(accent.light,accent.lightOpacity,DS1Color.white.light,0.28)
        let fillDark=Self.mix(accent.dark,accent.darkOpacity,DS1Color.black.light,0.20)
        let inkLight=Self.mix(accent.light,accent.lightOpacity,0,0.45)
        let inkDark=Self.mix(accent.dark,accent.darkOpacity,DS1Color.white.light,0.30)
        background=DS1Color(light:fillLight.0,dark:fillDark.0,lightOpacity:fillLight.1,darkOpacity:fillDark.1)
        ink=DS1Color(light:inkLight.0,dark:inkDark.0,lightOpacity:inkLight.1,darkOpacity:inkDark.1)
    }
    private static func mix(_ accent: UInt32,_ opacity: Double,_ ground: UInt32,_ weight: Double) -> (UInt32,Double) {
        let a=max(0,min(1,opacity))*weight,b=1-weight,alpha=a+b
        let rgb=[16,8,0].reduce(UInt32(0)) { result,shift in
            let value=(Double((accent >> shift)&255)*a + Double((ground >> shift)&255)*b)/alpha
            return result | (UInt32(value.rounded()) << shift)
        }
        return (rgb,alpha)
    }
}

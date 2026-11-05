import SwiftUI

/// The stat's label on one square, figure on two, and caption on one.
/// Its container owns the column width; long labels and captions keep their complete words.
public struct DS1Stat: View {
    let label: String
    let value: String
    let caption: String
    public init(_ label: String, value: String, caption: String = "") {
        self.label = label; self.value = value; self.caption = caption
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            DS1LineText(label, wrap: true)
            DS1LineText(value, style: .display, strong: true)
                .monospacedDigit().fixedSize(horizontal: true, vertical: false)
            if !caption.isEmpty { DS1LineText(caption, tone: .muted, wrap: true) }
        }
        .accessibilityElement(children: .combine)
    }
}

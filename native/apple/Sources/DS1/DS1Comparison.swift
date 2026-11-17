import SwiftUI

public struct DS1ComparisonValues: Hashable, Sendable {
    public let current: Double?
    public let previous: Double?
    public let maximum: Double
    public init(current: Double?, previous: Double?, maximum: Double? = nil) {
        self.current = current.flatMap { $0.isFinite ? $0 : nil }
        self.previous = previous.flatMap { $0.isFinite ? $0 : nil }
        self.maximum = maximum.flatMap { $0.isFinite && $0 > 0 ? $0 : nil } ?? max(self.current ?? 0, self.previous ?? 0, 1)
    }
    public var currentFraction: Double? { current.map { max(0, min(1, $0 / maximum)) } }
    public var previousFraction: Double? { previous.map { max(0, min(1, $0 / maximum)) } }
}

public struct DS1ComparisonBars: View {
    @Environment(\.ds1Scale) private var scale
    let values: DS1ComparisonValues
    let label: String
    let currentColor: DS1Color
    let previousColor: DS1Color
    public init(current: Double?, previous: Double?, maximum: Double? = nil, label: String, currentColor: DS1Color = .sharpBlue, previousColor: DS1Color = .textMuted) {
        values = DS1ComparisonValues(current: current, previous: previous, maximum: maximum)
        self.label = label; self.currentColor = currentColor; self.previousColor = previousColor
    }
    public var body: some View {
        if values.current != nil || values.previous != nil {
            Canvas { context, size in
                for (index, fraction) in [values.currentFraction, values.previousFraction].enumerated() {
                    guard let fraction else { continue }
                    let row = CGRect(x: 0, y: scale(CGFloat(index * 10 + 2)), width: size.width, height: scale(6))
                    context.fill(Path(row), with: .style(DS1Color.fill))
                    let bar = CGRect(x: row.minX, y: row.minY, width: row.width * fraction, height: row.height)
                    context.fill(Path(bar), with: .style(index == 0 ? currentColor : previousColor))
                }
            }
            .frame(height: scale.unit)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(label)
        }
    }
}

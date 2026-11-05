import SwiftUI

/// One date of the shared compact calendar. A caller supplies dates from its calendar model;
/// this view owns only the square layout, marks, selection and accessibility.
public struct DS1CalendarDay: Identifiable {
    public var id: String
    public var label: String
    public var inMonth: Bool
    public var today: Bool
    public var marks: [DS1Color]
    public var description: String
    public init(_ day: String, label: String, inMonth: Bool = true, today: Bool = false, marks: [DS1Color] = [], description: String) {
        id = day; self.label = label; self.inMonth = inMonth; self.today = today; self.marks = marks; self.description = description
    }
}

/// A compact month: seven one-square days across, weekday headings on one square.
/// The selected date takes the shared blue rounded square; today the red disc, nine tenths
/// of a square. Activity colours sit side by side under a date. The agenda belongs to the caller.
public struct DS1Calendar: View {
    @Environment(\.ds1Scale) private var scale
    let weekdays: [String]
    let days: [DS1CalendarDay]
    @Binding var value: String
    public init(weekdays: [String], days: [DS1CalendarDay], value: Binding<String>) {
        self.weekdays = weekdays; self.days = days; _value = value
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 0) {
                ForEach(Array(weekdays.prefix(7).enumerated()), id: \.offset) { _, label in
                    DS1LineText(label, style: .small, tone: .title).frame(width: scale.unit)
                }
            }
            LazyVGrid(columns: Array(repeating: GridItem(.fixed(scale.unit), spacing: 0), count: 7), spacing: 0) {
                ForEach(days) { day in
                    Button { value = day.id } label: {
                        Text(DS1Font.attributed(day.label, scale: scale))
                            .foregroundStyle(value == day.id || day.today ? DS1Color.white : day.marks.isEmpty ? DS1Color.title : DS1Color.text)
                            .frame(width: scale.unit * 0.9, height: scale.unit * 0.9)
                            .background {
                                if value == day.id { RoundedRectangle(cornerRadius: scale.radius).fill(DS1Color.sharpBlue) }
                                else if day.today { Circle().fill(DS1Color.redForBlood) }
                                else if !day.marks.isEmpty {
                                    HStack(spacing: 0) { ForEach(Array(day.marks.enumerated()), id: \.offset) { _, colour in Rectangle().fill(colour) } }
                                        .clipShape(RoundedRectangle(cornerRadius: scale.radius))
                                }
                            }
                            .opacity(day.inMonth ? 1 : 0.5)
                            .frame(width: scale.unit, height: scale.unit)
                            .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain).accessibilityLabel(day.description)
                    .accessibilityIdentifier("ds1-calendar-\(day.id)")
                    .accessibilityAddTraits(value == day.id ? [.isSelected] : [])
                }
            }
        }.frame(width: scale.squares(7))
    }
}

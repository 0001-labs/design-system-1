import SwiftUI

public struct DS1OverlayBox<Content: View, Footer: View>: View {
    @Environment(\.ds1Paper) private var paper
    @Environment(\.ds1Scale) private var scale
    let title: String?
    let description: String?
    let onClose: (() -> Void)?
    let content: Content
    let footer: Footer

    public init(title: String? = nil, description: String? = nil, onClose: (() -> Void)? = nil, @ViewBuilder content: () -> Content, @ViewBuilder footer: () -> Footer) {
        self.title = title; self.description = description; self.onClose = onClose; self.content = content(); self.footer = footer()
    }

    public var body: some View {
        GeometryReader { g in
            VStack(alignment: .leading, spacing: scale.unit) {
                if title != nil || description != nil {
                    VStack(alignment: .leading, spacing: 0) {
                        if let title { DS1LineText(title, strong: true, wrap: true).accessibilityAddTraits(.isHeader) }
                        if let description { DS1LineText(description, tone: .muted, wrap: true) }
                    }
                    .padding(.trailing, onClose == nil ? 0 : scale.unit)
                }
                content
                HStack(spacing: scale.half) { Spacer(minLength: 0); footer }.frame(minHeight: scale.unit)
            }
            .padding(scale.unit)
            .frame(width: min(scale.squares(20), g.size.width - 2 * scale.unit), alignment: .leading)
            .background(paper)
            .overlay(Rectangle().strokeBorder(DS1Color.border, lineWidth: DS1Metrics.line))
            .overlay(alignment: .topTrailing) {
                if let onClose {
                    Button(action: onClose) { DS1Icon(.close) }.buttonStyle(.plain).padding(scale.unit)
                        .accessibilityLabel(DS1Words.shared.text("Close"))
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .accessibilityAddTraits(.isModal)
    }
}

private struct DS1OverlayPresenter<Box: View>: ViewModifier {
    @Binding var isPresented: Bool
    let closeOnOutside: Bool
    let box: () -> Box
    func body(content: Content) -> some View {
        content.overlay {
            if isPresented {
                ZStack {
                    Rectangle().fill(DS1Color.black.withOpacity(0.4)).ignoresSafeArea()
                        .onTapGesture { if closeOnOutside { isPresented = false } }
                        .accessibilityHidden(true)
                    box()
                }
                .transition(.opacity)
            }
        }
    }
}

extension View {
    public func ds1Overlay<Box: View>(isPresented: Binding<Bool>, closeOnOutside: Bool = true, @ViewBuilder _ box: @escaping () -> Box) -> some View {
        modifier(DS1OverlayPresenter(isPresented: isPresented, closeOnOutside: closeOnOutside, box: box))
    }
}

@MainActor
public final class DS1Overlays: ObservableObject {
    public static let shared = DS1Overlays()

    enum Kind { case alert, confirm(danger: Bool), prompt(label: String?, placeholder: String) }
    struct Request: Identifiable {
        let id: UUID
        let kind: Kind
        let title: String
        let text: String?
        let confirm: String
        let cancel: String
        var value: String
        let done: (String?) -> Void
    }

    @Published var queue: [Request] = []
    private var promptValues: [UUID: String] = [:]

    private static func wait(kind: Kind, title: String, text: String?, confirm: String, cancel: String, value: String) async -> String? {
        let id = UUID()
        return await withTaskCancellationHandler {
            await withCheckedContinuation { continuation in
                guard !Task.isCancelled else { continuation.resume(returning: nil); return }
                shared.queue.append(Request(id: id, kind: kind, title: title, text: text, confirm: confirm, cancel: cancel, value: value) { continuation.resume(returning: $0) })
            }
        } onCancel: { Task { @MainActor in shared.cancel(id) } }
    }
    public static func alert(_ title: String, text: String? = nil, confirm: String? = nil) async {
        _ = await wait(kind: .alert, title: title, text: text, confirm: confirm ?? DS1Words.shared.text("OK"), cancel: "", value: "")
    }
    public static func confirm(_ title: String, text: String? = nil, confirm: String? = nil, cancel: String? = nil, danger: Bool = false) async -> Bool {
        await wait(kind: .confirm(danger: danger), title: title, text: text, confirm: confirm ?? DS1Words.shared.text("OK"), cancel: cancel ?? DS1Words.shared.text("Cancel"), value: "") != nil
    }
    public static func prompt(_ title: String, text: String? = nil, label: String? = nil, value: String = "", placeholder: String = "", confirm: String? = nil, cancel: String? = nil) async -> String? {
        await wait(kind: .prompt(label: label, placeholder: placeholder), title: title, text: text, confirm: confirm ?? DS1Words.shared.text("OK"), cancel: cancel ?? DS1Words.shared.text("Cancel"), value: value)
    }
    public static func cancelAll() { for request in shared.queue { shared.finish(request, nil) } }
    private func cancel(_ id: UUID) { if let request = queue.first(where: { $0.id == id }) { finish(request, nil) } }
    func promptValue(_ request: Request) -> String { promptValues[request.id] ?? request.value }
    func rememberPrompt(_ id: UUID, value: String) { if queue.contains(where: { $0.id == id }) { promptValues[id] = value } }
    func finish(_ request: Request, _ value: String?) {
        guard queue.contains(where: { $0.id == request.id }) else { return }
        queue.removeAll { $0.id == request.id }; promptValues[request.id] = nil; request.done(value)
    }

}

public struct DS1OverlayHost: View {
    @ObservedObject private var dialogs = DS1Overlays.shared
    @State private var value = ""
    public init() {}

    public var body: some View {
        if let request = dialogs.queue.first {
            let danger: Bool = { if case .confirm(let d) = request.kind { return d }; return false }()
            ZStack {
                Rectangle().fill(DS1Color.black.withOpacity(0.4)).ignoresSafeArea()
                    .onTapGesture { if !danger { dialogs.finish(request, nil) } }
                    .accessibilityHidden(true)
                DS1OverlayBox(title: request.title, description: request.text) {
                    if case .prompt(let label, let placeholder) = request.kind {
                        DS1Field(placeholder, text: $value, label: label).onSubmit { dialogs.finish(request, value) }
                    }
                } footer: {
                    switch request.kind {
                    case .alert:
                        Button(request.confirm) { dialogs.finish(request, "") }.buttonStyle(.ds1(.primary))
                    case .confirm(let danger):
                        Button(request.cancel) { dialogs.finish(request, nil) }.buttonStyle(.ds1(.secondary))
                        if danger {
                            DS1DangerButton(request.confirm) { dialogs.finish(request, "") }
                        } else {
                            Button(request.confirm) { dialogs.finish(request, "") }.buttonStyle(.ds1(.primary))
                        }
                    case .prompt:
                        Button(request.cancel) { dialogs.finish(request, nil) }.buttonStyle(.ds1(.secondary))
                        Button(request.confirm) { dialogs.finish(request, value) }.buttonStyle(.ds1(.primary))
                    }
                }
            }
            .onAppear { value = dialogs.promptValue(request) }
            .onChange(of: value) { _, value in dialogs.rememberPrompt(request.id, value: value) }
            .id(request.id)
        }
    }
}

import SwiftUI
#if canImport(UIKit)
import UIKit

struct DS1PresentationLayer: View {
    @ObservedObject private var dialogs = DS1Overlays.shared
    @ObservedObject private var messages = DS1Toast.shared
    @Environment(\.ds1Scale) private var scale
    @Environment(\.ds1Paper) private var paper
    @Environment(\.colorScheme) private var scheme
    @Environment(\.locale) private var locale
    @Environment(\.scenePhase) private var phase
    let toasts: Bool
    let confirmations: Bool
    var body: some View {
        if (confirmations && !dialogs.queue.isEmpty) || (toasts && !messages.items.isEmpty) {
            DS1LayerBridge(toasts: toasts, confirmations: confirmations, request: confirmations ? dialogs.queue.first?.id : nil,
                           scale: scale, paper: paper, scheme: scheme, locale: locale, active: phase == .active)
                .frame(width: 0, height: 0).allowsHitTesting(false).accessibilityHidden(true)
        }
    }
}

struct DS1ToastFrames: PreferenceKey {
    static var defaultValue: [CGRect] = []
    static func reduce(value: inout [CGRect], nextValue: () -> [CGRect]) { value += nextValue() }
}

private struct DS1LayerContent: View {
    let toasts: Bool
    let confirmations: Bool
    let frames: ([CGRect]) -> Void
    var body: some View {
        ZStack {
            if toasts { DS1ToastHost().onPreferenceChange(DS1ToastFrames.self, perform: frames) }
            if confirmations { DS1OverlayHost() }
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
private final class DS1LayerAnchor: UIView {
    var moved: (() -> Void)?
    override func didMoveToWindow() { super.didMoveToWindow(); moved?() }
}
private final class DS1MessageWindow: UIWindow {
    var modal = false
    var chips: [CGRect] = []
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        guard modal || chips.contains(where: { $0.contains(point) }) else { return nil }
        return super.hitTest(point, with: event)
    }
}

private struct DS1LayerBridge: UIViewRepresentable {
    let toasts: Bool
    let confirmations: Bool
    let request: UUID?
    let scale: DS1Scale
    let paper: DS1Color
    let scheme: ColorScheme
    let locale: Locale
    let active: Bool
    func makeCoordinator() -> Coordinator { Coordinator() }
    func makeUIView(context: Context) -> DS1LayerAnchor {
        let view = DS1LayerAnchor()
        view.moved = { [weak view, weak coordinator = context.coordinator] in if let view { coordinator?.attach(view) } }
        return view
    }
    func updateUIView(_ view: DS1LayerAnchor, context: Context) { context.coordinator.options = self; context.coordinator.attach(view) }
    static func dismantleUIView(_ view: DS1LayerAnchor, coordinator: Coordinator) { view.moved = nil; coordinator.close() }

    @MainActor final class Coordinator {
        private static weak var presenter: Coordinator?
        var options: DS1LayerBridge?
        private weak var base: UIWindow?
        private var window: DS1MessageWindow?
        private var controller: UIHostingController<AnyView>?
        private var lastRequest: UUID?
        func attach(_ anchor: DS1LayerAnchor) {
            guard let options, let base = anchor.window, let scene = base.windowScene else { return }
            self.base = base
            guard options.active, scene.activationState == .foregroundActive else { hide(); return }
            if let presenter = Self.presenter, presenter !== self { return }
            Self.presenter = self
            let layer: DS1MessageWindow
            if let window { layer = window } else {
                layer = DS1MessageWindow(windowScene: scene); layer.backgroundColor = .clear; layer.isOpaque = false
                layer.windowLevel = .alert + 1
                window = layer
            }
            let root = AnyView(DS1LayerContent(toasts: options.toasts, confirmations: options.confirmations, frames: { [weak layer] in layer?.chips = $0 })
                .environment(\.ds1Scale, options.scale).environment(\.ds1Paper, options.paper)
                .environment(\.locale, options.locale).environment(\.colorScheme, options.scheme)
                .preferredColorScheme(options.scheme))
            if let controller { controller.rootView = root } else {
                let controller = UIHostingController(rootView: root); controller.view.backgroundColor = .clear; controller.view.isOpaque = false
                self.controller = controller; layer.rootViewController = controller
            }
            layer.frame = base.frame; layer.overrideUserInterfaceStyle = options.scheme == .dark ? .dark : .light
            layer.modal = options.request != nil; controller?.view.accessibilityViewIsModal = layer.modal
            layer.isHidden = false
            if layer.modal { layer.makeKey() } else if layer.isKeyWindow { base.makeKey() }
            if lastRequest != options.request {
                lastRequest = options.request
                DispatchQueue.main.async { [weak self] in
                    guard let self, self.lastRequest == options.request, self.window?.isHidden == false else { return }
                    UIAccessibility.post(notification: .screenChanged, argument: nil)
                }
            }
        }
        private func hide() {
            if window?.isKeyWindow == true, let base, !base.isHidden { base.makeKey() }
            window?.isHidden = true
        }
        func close() {
            hide(); window?.rootViewController = nil; controller = nil; window = nil
            if Self.presenter === self { Self.presenter = nil }
        }
    }
}
#endif

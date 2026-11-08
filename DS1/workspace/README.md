# Workspace shell

An opt-in DS1 workspace pattern shared by the two current consumers, p-admin and maiar's planning portal. It retains the reference board's geometry: a display wordmark, centred search on 18 squares, 32px header controls, compact layout at 600px and an optional translucent header above a wallpaper.

Add `data-workspace-shell` on the workspace root (a `ds-page` or the document body). Inside `.page-header`, keep `.workspace-tabs`, `.header-find` with `.header-search`, and `.actions`. Controls and navigation remain product-owned. Add `data-workspace-wallpaper` when the header stands over the wallpaper.

Copy the `Workspace shell` source's `web` export with Sync 1. Import `workspace.css` after the DS1 foundation. Framework consumers use `workspacePhoneQuery` and retain DOM ownership; native consumers mark the view switch with `data-workspace-views` and call `connectWorkspaceHeader` to move the same controls beside search on a phone. This keeps view state and listeners intact.

The shell does not own authentication, routes, records, filters or save behavior. No other product adopts this pattern automatically. Existing DS1 component and Aa versions remain pinned separately.

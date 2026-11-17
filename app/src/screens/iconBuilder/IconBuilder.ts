import { html } from "lit";
import "../../../../DS1/0-face/tooltips";
import "../../../../DS1/1-root/controls.css";
import "../../../../DS1/2-core/ds-checkbox";
import "../../../../DS1/2-core/ds-color";
import "../../../../DS1/2-core/ds-file-picker";
import "../../../../DS1/2-core/ds-input";
import "../../../../DS1/2-core/ds-swatch";
import "../../../../DS1/3-unit/ds-select";
import "../../../../DS1/3-unit/ds-tabs";
import "../../../../DS1/4-page/ds-app";
import { authState } from "../../lib/backend";
import { AppElement, defineElement } from "../../lib/element";
import { button, loading, notice } from "../../lib/ui";
import { OwnerSession } from "../AdoptionDashboard";
import "../SignIn";
import { builderMarkup } from "./markup";
import "./icon-builder.css";

export class IconBuilder extends AppElement {
  #session = new OwnerSession(this, "Icon builder · Design system 1");

  override render() {
    const { isLoading, isAuthenticated } = authState.get();
    const { ready, error, leave } = this.#session;
    if (isLoading) return html`<main class="icon-builder-status">${loading("Checking your session")}</main>`;
    if (!isAuthenticated) return html`<div class="app-shell"><ds1-sign-in private-title="Icon builder" .redirectTo=${"/"}></ds1-sign-in></div>`;
    if (error) return html`<main class="icon-builder-status">${notice(error, { tone: "danger", actions: button("Sign out", () => void leave()) })}</main>`;
    if (!ready) return html`<main class="icon-builder-status">${loading("Checking access")}</main>`;
    return html`<ds1-icon-studio .signOut=${leave}></ds1-icon-studio>`;
  }
}
defineElement("ds1-icon-builder", IconBuilder);

export class IconStudio extends AppElement {
  static properties = { signOut: { attribute: false } };
  declare signOut: () => Promise<void>;

  constructor() {
    super();
    this.signOut = async () => {};
  }

  override firstUpdated() {
    const host = this.querySelector<HTMLElement>("[data-builder]")!;
    host.innerHTML = builderMarkup();
    void import("./editor");
  }

  override render() {
    return html`<ds-app name="Icon builder" home="/" class="icon-builder">
      <div slot="actions">${button("Sign out", () => void this.signOut(), { secondary: false })}</div>
      <main data-builder></main>
    </ds-app>`;
  }
}
defineElement("ds1-icon-studio", IconStudio);

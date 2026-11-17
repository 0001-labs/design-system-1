export type SocialSignIn = 'google' | 'apple'

export type SignInAvailability = { google: boolean; apple: boolean; newAccounts: boolean; code: boolean }

export type SignInAdapter = {
  providers(): Promise<SignInAvailability>
  passwordSignIn(email: string): Promise<boolean>
  requestCode(email: string): Promise<void>
  signInWithCode(email: string, code: string): Promise<void>
  signInWithPassword(email: string, password: string): Promise<void>
  signInWith(provider: SocialSignIn): Promise<void>
}

export type SignInWords = typeof ENGLISH
export const ENGLISH = {
  enterEmail: 'Enter your email',
  email: 'Email',
  continue: 'Continue',
  enterCode: 'Enter the code we sent to {email}',
  code: 'Code',
  enterPassword: 'Enter your password',
  password: 'Password',
  signIn: 'Sign in',
  sendAgain: 'Send the code again',
  anotherEmail: 'Use another email',
  google: 'Continue with Google',
  apple: 'Continue with Apple',
  invalidEmail: 'Enter a valid email.',
  invalidCode: 'The code is six digits.',
  failed: 'Sign-in did not go through. Try again.',
  codeUnavailable: 'Sign-in by email is not ready here yet.',
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function element<K extends keyof HTMLElementTagNameMap>(tag: K, attributes: Record<string, string | boolean> = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  for (const [name, value] of Object.entries(attributes)) {
    if (value === false) continue
    node.setAttribute(name, value === true ? '' : value)
  }
  node.append(...children)
  return node
}

function markCut(node: Element) {
  if (node.scrollWidth > node.clientWidth + 1) {
    if (node.getAttribute('data-cut') !== 'end') node.setAttribute('data-cut', 'end')
  } else if (node.hasAttribute('data-cut')) node.removeAttribute('data-cut')
}

export class SignInScreen extends HTMLElement {
  private backend: SignInAdapter | null = null
  get adapter(): SignInAdapter | null {
    return this.backend
  }
  set adapter(adapter: SignInAdapter | null) {
    this.backend = adapter
    if (adapter && this.isConnected) void this.loadProviders()
  }
  words: SignInWords = ENGLISH
  private way: 'code' | 'password' | null = null
  private email = ''
  private busy = false
  private available: SignInAvailability | null = null
  private readonly emailInput = element('input', { id: 'sign-in-email', name: 'email', type: 'email', autocomplete: 'username', required: true, maxlength: '254', enterkeyhint: 'next' })
  private readonly secretInput = element('input', { id: 'sign-in-secret', name: 'secret', type: 'text', required: true, maxlength: '256', enterkeyhint: 'go' })
  private readonly emailLabel = element('label', { for: 'sign-in-email' })
  private readonly secretLabel = element('label', { for: 'sign-in-secret' })
  private readonly continueButton = element('button', { type: 'button' })
  private readonly signInButton = element('button', { type: 'submit' })
  private readonly sendAgainButton = element('button', { type: 'button' })
  private readonly anotherEmailButton = element('button', { type: 'button' })
  private readonly googleButton = element('button', { type: 'button' })
  private readonly appleButton = element('button', { type: 'button' })
  private readonly error = element('p', { class: 'sign-in-error', role: 'alert', hidden: true })
  private readonly emailStep = element('div', { class: 'sign-in-step' })
  private readonly secretStep = element('div', { class: 'sign-in-step', hidden: true })
  private readonly providers = element('div', { class: 'sign-in-providers', hidden: true })
  private readonly googleRow = element('div', { class: 'sign-in-row', hidden: true })
  private readonly appleRow = element('div', { class: 'sign-in-row', hidden: true })
  private rendered = false
  private cuts: ResizeObserver | null = null

  connectedCallback() {
    if (!this.rendered) this.render()
    if (!this.cuts && typeof ResizeObserver !== 'undefined') {
      const cuts = new ResizeObserver((entries) => { for (const entry of entries) markCut(entry.target) })
      for (const node of this.cutWords()) cuts.observe(node)
      this.cuts = cuts
    }
    document.fonts?.ready.then(() => this.measureCuts(), () => {})
    void this.loadProviders()
  }

  disconnectedCallback() {
    this.cuts?.disconnect()
    this.cuts = null
  }

  private cutWords(): Element[] {
    return [this.emailLabel, this.secretLabel, this.error]
  }

  private measureCuts() {
    for (const node of this.cutWords()) markCut(node)
  }

  private render() {
    this.rendered = true
    this.emailStep.append(this.emailLabel, element('div', { class: 'sign-in-row' }, this.emailInput, this.continueButton))
    this.secretStep.append(this.secretLabel, element('div', { class: 'sign-in-row' }, this.secretInput, this.signInButton), element('div', { class: 'sign-in-small' }, this.sendAgainButton, this.anotherEmailButton))
    this.googleRow.append(this.googleButton)
    this.appleRow.append(this.appleButton)
    this.providers.append(this.googleRow, this.appleRow)
    const form = element('form', { novalidate: true }, this.emailStep, this.secretStep, this.error, this.providers)
    this.append(form)
    this.applyWords()
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      void (this.way ? this.finish() : this.continue())
    })
    this.emailInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        void this.continue()
      }
    })
    this.continueButton.addEventListener('click', () => void this.continue())
    this.sendAgainButton.addEventListener('click', () => void this.sendCode())
    this.anotherEmailButton.addEventListener('click', () => this.reset())
    this.googleButton.addEventListener('click', () => void this.social('google'))
    this.appleButton.addEventListener('click', () => void this.social('apple'))
  }

  applyWords() {
    const w = this.words
    this.emailLabel.textContent = w.enterEmail
    this.emailInput.placeholder = w.email
    this.continueButton.textContent = w.continue
    this.signInButton.textContent = w.signIn
    this.sendAgainButton.textContent = w.sendAgain
    this.anotherEmailButton.textContent = w.anotherEmail
    this.googleButton.textContent = w.google
    this.appleButton.textContent = w.apple
    this.showWay()
  }

  private showWay() {
    const w = this.words
    if (this.way === 'password') {
      this.secretLabel.textContent = w.enterPassword
      this.secretInput.placeholder = w.password
      this.secretInput.type = 'password'
      this.secretInput.autocomplete = 'current-password'
      this.secretInput.removeAttribute('inputmode')
      this.secretInput.removeAttribute('pattern')
      this.sendAgainButton.hidden = true
    } else if (this.way === 'code') {
      this.secretLabel.textContent = w.enterCode.replace('{email}', this.email)
      this.secretInput.placeholder = w.code
      this.secretInput.type = 'text'
      this.secretInput.autocomplete = 'one-time-code'
      this.secretInput.inputMode = 'numeric'
      this.secretInput.setAttribute('pattern', '[0-9]*')
      this.sendAgainButton.hidden = false
    }
    this.measureCuts()
  }

  private async loadProviders() {
    if (!this.adapter) return
    try {
      const available = await this.adapter.providers()
      this.available = available
      this.googleRow.hidden = !available.google
      this.appleRow.hidden = !available.apple
      this.providers.hidden = !(available.google || available.apple)
    } catch {
      this.providers.hidden = true
    }
  }

  private setBusy(busy: boolean) {
    this.busy = busy
    for (const button of [this.continueButton, this.signInButton, this.sendAgainButton, this.googleButton, this.appleButton]) button.disabled = busy
  }

  private fail(message: string) {
    this.error.textContent = message
    this.error.hidden = false
    markCut(this.error)
  }

  private clearError() {
    this.error.textContent = ''
    this.error.hidden = true
  }

  private async continue() {
    if (this.busy || !this.adapter) return
    this.clearError()
    const email = this.emailInput.value.trim().toLowerCase()
    if (!EMAIL_SHAPE.test(email)) return this.fail(this.words.invalidEmail)
    this.email = email
    this.setBusy(true)
    try {
      this.way = (await this.adapter.passwordSignIn(email)) ? 'password' : 'code'
      if (this.way === 'code' && this.available && !this.available.code) throw new Error(this.words.codeUnavailable)
      if (this.way === 'code') await this.adapter.requestCode(email)
      this.showWay()
      this.emailStep.hidden = true
      this.providers.hidden = true
      this.secretStep.hidden = false
      this.secretInput.value = ''
      this.secretInput.focus()
    } catch (problem) {
      this.way = null
      this.fail(problem instanceof Error && problem.message ? problem.message : this.words.failed)
    } finally {
      this.setBusy(false)
    }
  }

  private async sendCode() {
    if (this.busy || !this.adapter || this.way !== 'code') return
    this.clearError()
    this.setBusy(true)
    try {
      await this.adapter.requestCode(this.email)
      this.secretInput.focus()
    } catch (problem) {
      this.fail(problem instanceof Error && problem.message ? problem.message : this.words.failed)
    } finally {
      this.setBusy(false)
    }
  }

  private async finish() {
    if (this.busy || !this.adapter || !this.way) return
    this.clearError()
    const secret = this.secretInput.value.trim()
    if (this.way === 'code' && !/^\d{6}$/.test(secret)) return this.fail(this.words.invalidCode)
    if (!secret) return
    this.setBusy(true)
    try {
      if (this.way === 'code') await this.adapter.signInWithCode(this.email, secret)
      else await this.adapter.signInWithPassword(this.email, secret)
      this.dispatchEvent(new CustomEvent('signed-in', { detail: { email: this.email, way: this.way }, bubbles: true }))
    } catch (problem) {
      this.fail(problem instanceof Error && problem.message ? problem.message : this.words.failed)
      this.secretInput.select()
    } finally {
      this.setBusy(false)
    }
  }

  private async social(provider: SocialSignIn) {
    if (this.busy || !this.adapter) return
    this.clearError()
    this.setBusy(true)
    try {
      await this.adapter.signInWith(provider)
    } catch (problem) {
      this.fail(problem instanceof Error && problem.message ? problem.message : this.words.failed)
      this.setBusy(false)
    }
  }

  reset() {
    this.way = null
    this.clearError()
    this.secretStep.hidden = true
    this.emailStep.hidden = false
    void this.loadProviders()
    this.emailInput.focus()
  }
}

export function defineSignInScreen(tag = 'sign-in-screen') {
  if (!customElements.get(tag)) customElements.define(tag, SignInScreen)
}

declare global {
  interface HTMLElementTagNameMap {
    'sign-in-screen': SignInScreen
  }
}

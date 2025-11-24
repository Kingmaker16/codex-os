import type { Page } from "playwright";

export async function injectRecaptchaToken(
  page: Page,
  token: string,
  siteKey: string
): Promise<void> {
  // This is a simple pattern for sites that expect token in a textarea or hidden input:
  // Many sites integrate reCAPTCHA via grecaptcha.execute, etc.
  // For v3/v2-invisible, token is often sent with form data.
  // For now, we will inject a token into a hidden textarea or input with name="g-recaptcha-response".

  await page.evaluate((tkn) => {
    const fields = [
      document.querySelector('textarea[name="g-recaptcha-response"]'),
      document.querySelector('input[name="g-recaptcha-response"]'),
    ];
    for (const field of fields) {
      if (field) {
        (field as HTMLTextAreaElement | HTMLInputElement).value = tkn;
      }
    }
  }, token);
}

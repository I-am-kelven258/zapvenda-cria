<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep access plans in a shared browser-safe module and expose /planos outside the authenticated layout so visitors can reach checkout without signing in.
- Generate application scripts locally with the template generator in src/lib/script.ts; no external paid API, so generation never depends on provider credit.
- Use the shared browser session validator for route access, login redirects and script saves; missing/invalid credentials resolve to signed-out, expired tokens get one refresh, and transient network failures remain errors.

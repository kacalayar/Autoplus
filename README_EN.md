# aBaiAutoplus

<p align="center">
  <b>Multi-Platform AI Account Auto-Registration & Management · One-Click ChatGPT Plus Activation via Protocol/Browser Payment</b>
</p>

<p align="center">
  <a href="https://github.com/asz798838958/aBaiAutoplus/stargazers"><img src="https://img.shields.io/github/stars/asz798838958/aBaiAutoplus?style=for-the-badge&logo=github&color=FFB003" alt="Stars" /></a>
  <a href="https://github.com/asz798838958/aBaiAutoplus/network/members"><img src="https://img.shields.io/github/forks/asz798838958/aBaiAutoplus?style=for-the-badge&logo=github&color=blue" alt="Forks" /></a>
  <a href="https://github.com/asz798838958/aBaiAutoplus/releases"><img src="https://img.shields.io/github/v/release/asz798838958/aBaiAutoplus?style=for-the-badge&logo=github&color=green" alt="Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/asz798838958/aBaiAutoplus?style=for-the-badge&color=orange" alt="License" /></a>
</p>

<p align="center">
  <b>Auto-registration & management for AI platform accounts including ChatGPT Plus</b><br/>
  <b>Protocol / Browser Dual Mode · PayPal Browser Registration + Built-in GoPay Protocol Payment for ChatGPT Plus · Mac / Windows Desktop One-Click Launch</b>
</p>

> ⚠️ **Disclaimer**: This project is intended for learning and research purposes only. It must not be used for any commercial purposes, nor for any activities that violate the Terms of Service (ToS) of the target platforms. All consequences arising from the use of this project are the sole responsibility of the user.

> 🙏 **Credits**: This project is a derivative work based on [`lxf746/any-auto-register`](https://github.com/lxf746/any-auto-register), extending the plugin-based registration framework with **PayPal browser registration for ChatGPT Plus** and **GoPay protocol registration for ChatGPT Plus**. Thanks to the original author for the open-source work. This repository is maintained independently from the upstream project.

A multi-platform account auto-registration & management system with plugin-based extensibility, featuring a built-in Web UI and desktop client.

## Table of Contents

- [New Capabilities vs. Upstream](#new-capabilities-vs-upstream)
- [Features](#features)
- [Supported Platforms](#supported-platforms)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Desktop Client Download](#desktop-client-download)
- [Docker Deployment](#docker-deployment)
- [GoPay Payment for ChatGPT Plus](#gopay-payment-for-chatgpt-plus)
- [Email Service Configuration](#email-service-configuration)
- [Captcha Service Configuration](#captcha-service-configuration)
- [Proxy Pool Configuration](#proxy-pool-configuration)
- [SMS Verification Service Configuration](#sms-verification-service-configuration)
- [Account Lifecycle Management](#account-lifecycle-management)
- [Registration Success Rate Dashboard](#registration-success-rate-dashboard)
- [Any2API Integration](#any2api-integration)
- [Project Structure](#project-structure)
- [Plugin Development](#plugin-development)
- [Security Notes](#security-notes)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

## New Capabilities vs. Upstream

This project focuses on extending [`any-auto-register`](https://github.com/lxf746/any-auto-register) with the following key capabilities:

| New Capability                                  | Description                                                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 💳 **PayPal Japan/US Region Pay for ChatGPT Plus** | Multi-threaded PayPal browser payment, automatically completing the entire ChatGPT Plus subscription flow                                         |
| 💳 **GoPay Pay for ChatGPT Plus**              | Indonesian GoPay protocol-based payment, automatically completing the full ChatGPT Plus subscription flow: "Generate payment link → Midtrans checkout → GoPay 14-step API payment" |
| 📱 **GoPay Account Auto-Registration**          | Indonesian phone number + PIN protocol registration for GoPay accounts, with SMS provider rotation                                                     |
| 🧾 **SMS Provider Expansion**                   | Beyond the original SMS-Activate / HeroSMS, added SMSPool and SMSBower providers                                                                       |
| 🌐 **Standalone Customer/Admin API**            | `customer_portal_api/` provides a multi-tenant portal backend that can be deployed independently                                                       |

> Other platform registrations, email/captcha/proxy providers, lifecycle management, success rate dashboard, and similar capabilities are inherited from and remain compatible with the upstream framework.

## Features

- **Multi-Platform Support**: ChatGPT, Cursor, Kiro, Trae.ai, Tavily, Grok, Blink, Cerebras, OpenBlockLabs, Windsurf, GoPay, with custom plugin extension support (Anything universal adapter)
- **Multiple Email Services**: MoeMail (self-hosted), Laoudo, DuckMail, Testmail, Cloudflare Worker self-built email, Freemail, TempMail.lol, Temp-Mail Web, DuckDuckGo Email
- **Multiple Execution Modes**: API protocol (no browser), headless browser, headed browser (supported as needed per platform)
- **Captcha Services**: YesCaptcha, 2Captcha, Local Solver (Camoufox)
- **SMS Verification Services**: SMS-Activate, HeroSMS, SMSPool, SMSBower
- **Proxy Pool Management**: Static proxy rotation + dynamic proxy API extraction + rotating gateway proxies, with success rate statistics and automatic disabling of failed proxies
- **Account Lifecycle**: Scheduled validity checks, automatic token renewal, trial expiration warnings
- **Registration Success Rate Dashboard**: Success rate statistics by platform, day, and proxy, with error aggregation analysis
- **Concurrent Registration**: Configurable concurrency
- **Real-Time Logs**: SSE-based real-time push of registration logs to the frontend
- **Account Export**: Supports multiple formats including JSON, CSV, CPA, Sub2API, Kiro-Go, Any2API
- **Any2API Integration**: Automatically pushes accounts to the Any2API gateway upon successful registration, ready to use immediately
- **Platform Extension Operations**: Each platform can define custom operations (e.g., Kiro account switching, Trae Pro upgrade link generation, GoPay Plus payment)

## Supported Platforms

| Platform       | Protocol Mode | Browser Mode | OAuth | Notes                                       |
| -------------- | :-----------: | :----------: | :---: | ------------------------------------------- |
| ChatGPT        |      ✅       |      ✅      |  ✅   | Plus payment link / PayPal checkout        |
| Cursor         |      ✅       |      ✅      |  ✅   | Phone verification required                 |
| Kiro           |      ✅       |      ✅      |  ✅   | Account switching supported                 |
| Trae.ai        |      ✅       |      ✅      |  ✅   | Pro upgrade link generation                 |
| Grok           |      ✅       |      ✅      |  ✅   |                                             |
| Windsurf       |      ✅       |      ✅      |  ✅   | Trial link generation                       |
| Tavily         |      ✅       |      ✅      |  ✅   |                                             |
| Blink          |      ✅       |      ✅      |  ✅   |                                             |
| Cerebras       |      ✅       |      ✅      |  ✅   |                                             |
| OpenBlockLabs  |      ✅       |      ✅      |  ✅   |                                             |
| GoPay          |      ✅       |      —      |  —    | Indonesian GoPay, phone + PIN, pay for Plus |
| Anything       |      ✅       |      ✅      |  —    | Universal adapter, configure to onboard new platforms |

> The actual executors supported by each platform are determined by the plugin's `supported_executors` declaration, which can be viewed and overridden on the "Platform Capabilities" page in the Web UI.

## Screenshots

> 📸 _Screenshots will be continuously updated with each release._


### GoPay Registration to Generate GPT Plus

![GoPay registration to generate gpt plus](assets/screenshots/gopay注册生成gptplus.png)

### PayPal Registration for GPT Plus

![PayPal registration for gpt plus](assets/screenshots/PayPal注册gptplus.png)

### PayPal Registration for GPT Plus

![PayPal registration for gpt plus](assets/screenshots/PayPal注册gptplus2.png)

### Settings

![Settings](assets/screenshots/设置2.png)
![Settings](assets/screenshots/设置.png)

## Tech Stack

| Layer             | Technology                                |
| ----------------- | ----------------------------------------- |
| Backend           | FastAPI + SQLite (SQLModel)               |
| Frontend          | React + TypeScript + Vite + TailwindCSS   |
| HTTP              | curl_cffi / tls_client (browser fingerprinting) |
| Browser Automation| Playwright / Camoufox / BitBrowser        |
| Desktop           | Electron (bundled backend + frontend)     |

## Quick Start

### Requirements

- Python 3.11+
- Node.js 18+

### Installation

#### macOS / Linux

```bash
# Clone the project
git clone https://github.com/asz798838958/aBaiAutoplus.git
cd aBaiAutoplus

# Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Build the frontend
cd frontend
npm install
npm run build
cd ..
```

#### Windows

```bat
:: Clone the project
git clone https://github.com/asz798838958/aBaiAutoplus.git
cd aBaiAutoplus

:: Create a virtual environment
python -m venv .venv
.venv\Scripts\activate

:: Install backend dependencies
pip install -r requirements.txt

:: Build the frontend
cd frontend
npm install
npm run build
cd ..
```

### Install Browsers (Optional, required for headless/headed browser modes)

```bash
# Playwright browsers
python3 -m playwright install chromium

# Camoufox (for local Turnstile Solver)
python3 -m camoufox fetch
```

### Configure Environment Variables (Optional)

Copy the example file and fill in as needed:

```bash
cp .env.example .env
```

All third-party API keys (SMS, captcha, proxy) are configured via environment variables or the Web UI. **The repository does not contain any real keys.**

### Launch

#### macOS / Linux

```bash
.venv/bin/python3 -m uvicorn main:app --port 8000
```

#### Windows

```bat
.venv\Scripts\python -m uvicorn main:app --port 8000
```

Open your browser and visit `http://localhost:8000`

Notes:

- The unified entry point is `main:app`
- Backend APIs are uniformly located at `/api/*`
- In production mode, frontend build artifacts are served directly by the backend at `http://localhost:8000`
- In development mode, the frontend runs independently at `http://localhost:5173`, with API requests proxied through Vite
- The standalone Customer/Admin API project is documented in [customer_portal_api/README.md](customer_portal_api/README.md)

### Development Mode (Frontend Hot Reload)

```bash
cd frontend
npm run dev
# Visit http://localhost:5173
```

## Desktop Client Download

> 🚀 **Zero-Config One-Click Launch**: Don't want to fiddle with Python and Node.js? Download the desktop client and double-click to start.

| Platform                              | Download                                                                                |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| 🍎 macOS (Intel / Apple Silicon)      | [Download `.dmg` from Releases](https://github.com/asz798838958/aBaiAutoplus/releases/latest) |
| 🪟 Windows                            | [Download `.exe` from Releases](https://github.com/asz798838958/aBaiAutoplus/releases/latest) |

The desktop client is packaged with Electron, including a complete Python backend + React frontend, ready to use out of the box. Each new release (`v*` tag) is automatically built and published to Releases.

For source-based runs or self-packaging, refer to [Quick Start](#quick-start) above and the `electron/` directory.

## Docker Deployment

### Build from Source

```bash
git clone https://github.com/asz798838958/aBaiAutoplus.git
cd aBaiAutoplus
docker compose up -d --build
```

Example `docker-compose.yml`:

```yaml
services:
  app:
    build: .
    ports:
      - "8000:8000"   # FastAPI / Web UI
      - "6080:6080"   # noVNC (headed browser preview)
      - "8889:8889"   # Turnstile Solver
    environment:
      - DISPLAY=:99
      - ACCOUNT_MANAGER_DATABASE_URL=sqlite:////app/data/account_manager.db
      # Optional: set access password, leave unset for no password protection
      # - APP_PASSWORD=changeme
      # Optional: set VNC password
      # - VNC_PASSWORD=changeme
    volumes:
      - ./data:/app/data   # Persist SQLite database
    restart: unless-stopped
```

### Access URLs

| Service | Address                          | Description                          |
| ------- | -------------------------------- | ------------------------------------ |
| Web UI  | `http://localhost:8000`          | Main interface                       |
| noVNC   | `http://localhost:6080/vnc.html` | Visual browser (headed mode)         |
| Solver  | `http://localhost:8889`          | Turnstile captcha solver             |

> For cloud server deployment, ensure that the security group/firewall allows ports 8000, 6080, and 8889. For public deployment, be sure to set the `APP_PASSWORD` access password.

### Common Commands

```bash
docker compose logs -f      # View logs
docker compose restart      # Restart
docker compose down         # Stop
```

## GoPay Payment for ChatGPT Plus

This is the core extension feature of this project compared to upstream: protocol-based payment via Indonesian GoPay to automatically complete ChatGPT Plus subscription.

### Pipeline

The full chain consists of three steps (implementation in `application/gopay_pay_chatgpt.py`):

1. **Protocol** — Call `generate_plus_link(country=ID, currency=IDR)` to get ChatGPT's `cashier_url` (Stripe hosted checkout)
2. **Browser** — Open `cashier_url`, wait for the page to redirect to the Midtrans checkout domain, capture the `midtrans_url`
3. **Protocol** — Use a GoPay account to call `GoPayPayment.pay(midtrans_url, account)` to complete the 14-step Midtrans API payment

After successful payment, the corresponding ChatGPT account will be marked as `subscribed`.

### Usage

Operate from the "GoPay Pay for Plus" page in the Web UI, or via the API:

- `POST /api/tasks/gopay-pay-chatgpt` — Create a payment task (task type `gopay_pay_chatgpt`)

Main parameters:

| Parameter             | Description                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `chatgpt_account_ids` | List of ChatGPT account IDs to pay for; leave empty with `register_count` to register first |
| `register_count`      | When no accounts are selected, register N new ChatGPT accounts first, then pay            |
| `gopay_account_id`    | Specify a GoPay payment account; leave empty to auto-select/register per `gopay_source` policy |
| `gopay_source`        | `auto` (use pool first, then register) / `pool` (pool only) / `register` (force register) |
| `sms_provider`        | GoPay registration SMS provider: `herosms` / `smspool` / `smsbower`                        |
| `country` / `currency`| Default `ID` / `IDR`                                                                       |
| `checkout_mode`       | Browser backend: `camoufox` / `bitbrowser_*`                                              |
| `envelope_url`        | Optional, claim red envelope first to top up GoPay balance before payment                  |
| `concurrency`         | Concurrency for multiple accounts                                                         |

> GoPay account registration and payment rely on Indonesian phone number SMS verification (HeroSMS / SMSPool / SMSBower). Please configure the corresponding provider's API key in "Global Configuration" first. The GoPay PIN default value can be overridden via the task parameter `gopay_pin`.

## Email Service Configuration

A mailbox service must be selected during registration to receive verification codes. Mailbox, captcha, and SMS configurations are all driven by the backend provider catalog. The frontend "Global Configuration" page uses a list-style CRUD interface: the left side shows added providers, the right side uniformly edits the name, authentication method, and fields; the "Add Provider" dropdown only displays providers that the backend has integrated but not yet added.

### MoeMail (Recommended)

A self-hosted temporary mailbox service based on the open-source project [cloudflare_temp_email](https://github.com/dreamhunter2333/cloudflare_temp_email). No parameters are required—the system automatically registers a temporary account and generates an email address. Select **MoeMail** on the registration page and enter the URL of your deployed instance (a public instance is used by default).

### Laoudo

Uses a fixed self-owned domain mailbox with the highest stability, ideal for long-term use.

| Parameter   | Description                                                              |
| ----------- | ------------------------------------------------------------------------ |
| Email       | Full email address, e.g., `user@example.com`                             |
| Account ID  | Email account ID (visible in the Laoudo dashboard)                       |
| JWT Token   | Authentication token obtained from browser cookies or APIs after login   |

### Cloudflare Worker Self-Hosted Email

A self-hosted email service based on [cloudflare_temp_email](https://github.com/dreamhunter2333/cloudflare_temp_email), fully under your control.

| Parameter     | Description                                                                                |
| ------------- | ------------------------------------------------------------------------------------------ |
| API URL       | Worker's backend API address, e.g., `https://api.your-domain.com`                          |
| Admin Token   | Admin password, configured in the Worker's `ADMIN_PASSWORDS` environment variable          |
| Domain        | Email receiving domain, e.g., `your-domain.com` (MX records must point to Cloudflare)      |
| Fingerprint   | Optional, fill in if the Worker has fingerprint verification enabled                       |

### Freemail

A self-hosted email service based on Cloudflare Worker, supporting both admin token and username/password authentication.

| Parameter   | Description                                  |
| ----------- | -------------------------------------------- |
| API URL     | Freemail service address                     |
| Admin Token | Admin authentication token                   |
| Username    | Optional, for username/password auth         |
| Password    | Optional, for username/password auth         |

### Testmail

The namespace mailbox mode of `testmail.app`, automatically generating `{namespace}.{random tag}@inbox.testmail.app`, ideal for concurrent tasks.

| Parameter   | Description                                              |
| ----------- | -------------------------------------------------------- |
| API URL     | Default `https://api.testmail.app/api/json`              |
| Namespace   | Your namespace, e.g., `3xw8n`                            |
| Tag Prefix  | Optional, prefix for random tags                         |
| API Key     | API key from the testmail.app console                    |

### Other Public Mailboxes

- **DuckMail / TempMail.lol / Temp-Mail Web**: Public temporary mailboxes, no configuration required, but may require a proxy in some regions
- **DuckDuckGo Email**: Generates private aliases at `@duck.com`, requires filling in IMAP information for the forwarding email in Global Configuration

## Captcha Service Configuration

| Service       | Description                                                                                |
| ------------- | ------------------------------------------------------------------------------------------ |
| YesCaptcha    | Requires Client Key, register at [yescaptcha.com](https://yescaptcha.com) to obtain         |
| 2Captcha      | Requires API Key, register at [2captcha.com](https://2captcha.com) to obtain               |
| Local Solver  | Uses Camoufox for local decoding, requires `python3 -m camoufox fetch` to run first         |

## Proxy Pool Configuration

### Static Proxies

Manually add fixed proxy addresses on the proxy management page; the system polls by weighted success rate. Proxies that fail 5 times consecutively are automatically disabled.

### Dynamic Proxy Drivers

If a `proxy` provider is configured and enabled in the database, registration will prioritize trying dynamic proxies first, falling back to the static proxy pool on failure or when unconfigured.

| Provider                | Description                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| API Extraction Proxy    | Dynamically extracts proxy IPs via HTTP API, suitable for most proxy vendors' API extraction interfaces |
| Rotating Gateway Proxy  | Fixed entry address, automatically assigns different exit IPs per request, suitable for BrightData, Oxylabs, IPRoyal, etc. |

## SMS Verification Service Configuration

Some platforms require phone verification during registration (e.g., Cursor, GoPay). An SMS verification service can be configured to automate this:

| Service       | Description                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| SMS-Activate  | Requires API Key, configurable default country                                                |
| HeroSMS       | Requires API Key, configurable service code, country ID, max price, number reuse policy       |
| SMSPool       | Requires API Key, configurable country / service ID / max price                               |
| SMSBower      | Requires API Key, configurable service code, country ID                                       |

How to add: Click "Add SMS Provider" in the Web UI "Global Configuration → SMS Services", select the corresponding service, fill in the API Key, and set as default as needed. Registration tasks will prioritize the `sms_provider` parameter in the task; if not specified, the default SMS provider is used.

> 🔐 SMS API keys are configured via environment variables (e.g., `OPAI_SMSPOOL_API_KEY`, `OPAI_SMSBOWER_API_KEY`) or the Web UI. The repository does not contain any real keys.

## Account Lifecycle Management

The system has a built-in background lifecycle manager that automatically performs:

- **Validity Check**: Checks whether active accounts are still valid every 6 hours, marking invalid ones as `invalid`
- **Automatic Token Renewal**: Refreshes soon-to-expire tokens every 12 hours (currently supports ChatGPT)
- **Trial Expiration Warning**: Scans trial accounts, flags those about to expire, and updates the status of those already expired

Manually trigger APIs:

- `POST /api/lifecycle/check` — Validity check
- `POST /api/lifecycle/refresh` — Token refresh
- `POST /api/lifecycle/warn` — Expiration warning
- `GET /api/lifecycle/status` — View manager status

## Registration Success Rate Dashboard

- `GET /api/stats/overview` — Global overview (total registrations, success rate, status distribution)
- `GET /api/stats/by-platform` — Success rate statistics by platform
- `GET /api/stats/by-day?days=30` — Registration trend by day
- `GET /api/stats/by-proxy` — Proxy success rate ranking
- `GET /api/stats/errors?days=7` — Failure error aggregation

## Any2API Integration

When used together with the [Any2API](https://github.com/lxf746/any2api) project, accounts are automatically pushed to the gateway upon successful registration, ready to use immediately.

After setting `any2api_url` (e.g., `http://localhost:8099`) and `any2api_password` in Global Configuration, each successful registration will automatically push:

| Platform  | Push Target                  |
| --------- | ---------------------------- |
| Kiro      | `kiroAccounts` account pool  |
| Grok      | `grokTokens` token pool      |
| Cursor    | `cursorConfig` cookie        |
| ChatGPT   | `chatgptConfig` token        |
| Blink     | `blinkConfig` credentials    |
| Windsurf  | `windsurfAccounts` account pool |

This feature is silently skipped when `any2api_url` is not configured. You can also export manually:

- `POST /api/accounts/export/any2api` — Export in Any2API admin.json format
- `POST /api/accounts/export/kiro-go` — Export in Kiro-Go config.json format

## Project Structure

```
.
├── main.py                 # FastAPI entry point
├── Dockerfile              # Docker build
├── docker-compose.yml      # Docker Compose orchestration
├── requirements.txt        # Python dependencies
├── api/                    # HTTP routing layer (accounts / tasks / config / proxy / stats ...)
├── application/            # Application service layer
│   ├── gopay_pay_chatgpt.py    # GoPay payment for ChatGPT Plus orchestrator (extension in this project)
│   ├── tasks.py / task_commands.py  # Task orchestration and execution
│   └── ...
├── domain/                 # Domain models
├── infrastructure/         # Repositories and runtime adaptation
├── core/                   # Foundational capabilities
│   ├── base_platform.py    # Platform base class
│   ├── base_mailbox.py     # Mailbox service base class
│   ├── base_captcha.py     # Captcha service base class
│   ├── base_sms.py         # SMS service base class
│   ├── registration/       # Registration flow orchestration (adapters + flows)
│   ├── lifecycle.py        # Account lifecycle management
│   ├── proxy_pool.py       # Proxy pool (static + dynamic)
│   ├── registry.py         # Platform plugin registry
│   └── any2api_sync.py     # Any2API auto-push
├── platforms/              # Platform plugin layer
│   ├── chatgpt/            # ChatGPT (registration / Plus payment / PayPal checkout)
│   ├── gopay/              # GoPay registration + SMS providers (extension in this project)
│   ├── gopay-deploy/       # GoPay protocol payment core (Gojek / Midtrans)
│   └── {platform}/         # Other platform plugins
├── providers/              # Provider plugin layer (mailbox / captcha / sms / proxy)
├── services/               # Background services (Solver process management / task executor)
├── customer_portal_api/    # Standalone Customer/Admin API
├── electron/               # Electron desktop packaging
├── tests/                  # Tests
└── frontend/               # React frontend
```

## Plugin Development

Adding a new platform requires the following steps:

### 1. Create a Platform Directory

Create a new directory under `platforms/`. It must include `__init__.py` and `plugin.py` (`pkgutil.iter_modules` only scans Python packages with `__init__.py`):

```
platforms/myplatform/
├── __init__.py
├── plugin.py              # Platform adapter layer (required)
├── protocol_mailbox.py    # Protocol mode registration logic (as needed)
├── browser_register.py    # Browser registration logic (as needed)
└── browser_oauth.py       # Browser OAuth logic (as needed)
```

### 2. Implement plugin.py

```python
from core.base_platform import BasePlatform, Account, AccountStatus, RegisterConfig
from core.base_mailbox import BaseMailbox
from core.registration import ProtocolMailboxAdapter, OtpSpec, RegistrationResult
from core.registry import register


@register
class MyPlatform(BasePlatform):
    name = "myplatform"
    display_name = "My Platform"
    version = "1.0.0"

    def __init__(self, config: RegisterConfig = None, mailbox: BaseMailbox = None):
        super().__init__(config)
        self.mailbox = mailbox

    def build_protocol_mailbox_adapter(self):
        """Protocol mode registration adapter"""
        return ProtocolMailboxAdapter(
            result_mapper=lambda ctx, result: RegistrationResult(
                email=result["email"],
                password=result.get("password", ""),
                status=AccountStatus.REGISTERED,
            ),
            worker_builder=lambda ctx, artifacts: __import__(
                "platforms.myplatform.protocol_mailbox",
                fromlist=["MyWorker"],
            ).MyWorker(proxy=ctx.proxy, log_fn=ctx.log),
            register_runner=lambda worker, ctx, artifacts: worker.run(
                email=ctx.identity.email,
                password=ctx.password,
                otp_callback=artifacts.otp_callback,
            ),
            otp_spec=OtpSpec(wait_message="Waiting for verification email..."),
        )

    def check_valid(self, account: Account) -> bool:
        return bool(account.token)
```

### 3. Declare Platform Capabilities

Platform capabilities are declared via plugin class attributes by default, and can also be overridden on the "Platform Capabilities" page in the Web UI:

```python
class MyPlatform(BasePlatform):
    supported_executors = ["protocol"]
    supported_identity_modes = ["mailbox"]
    supported_oauth_providers = []
    capabilities = []
```

The system will automatically scan the `platforms/` directory at startup and load all plugins decorated with `@register`.

## Security Notes

This project handles account credentials, tokens, and third-party API keys. Please follow these security best practices:

- **Do not commit real credentials**: Account export files (`acc*.json`), databases (`*.db`), packet capture/debug dumps (`*_inspect.txt`, `otp_*.txt`, `*.har`) should all be ignored in `.gitignore`. Do not force commit them.
- **Keys via environment variables**: All SMS / captcha / proxy API keys are configured via environment variables or the Web UI. Do not hardcode them in source code. See [.env.example](.env.example).
- **Public deployment hardening**: Be sure to set `APP_PASSWORD` for Docker deployment; in `customer_portal_api` production environments, the default `PORTAL_JWT_SECRET` and admin password must be changed, and `PORTAL_CORS_ORIGINS` must be restricted.
- **Credential rotation**: If you suspect credentials have been leaked, immediately revoke/reset them on the corresponding platform's backend.

## FAQ

### What to do if captcha fails?

1. Confirm the captcha provider is correctly configured (YesCaptcha Client Key or local Solver)
2. In protocol mode, prefer using a remote captcha service (YesCaptcha / 2Captcha)
3. In browser mode, Camoufox will automatically try to click the Turnstile checkbox and fall back to a remote Solver on failure
4. For persistent failures, check proxy IP quality—high-risk IPs trigger stricter verification

### What if proxies are blocked / registration failure rate is high?

1. Check each proxy's success rate on the proxy management page, and disable proxies with low success rates
2. Use residential proxies instead of data center proxies—pass-through rates are significantly higher
3. Lower concurrency to avoid a large number of requests from the same IP in a short time
4. Different platforms have different sensitivities to IPs; assign proxy pools per platform

### What additional configuration does browser mode require?

```bash
python3 -m playwright install chromium   # Playwright browser
python3 -m camoufox fetch                # Camoufox (anti-fingerprint browser)
```

Browser mode supports both `headless` and `headed` modes, selectable in the executor options on the registration page.

### Use BitBrowser instead of Camoufox

The full ChatGPT registration / payment link generation / PayPal auto-checkout flow supports switching the browser backend from Camoufox to [BitBrowser](https://www.bitbrowser.cn/). Its profile persistence (cookies / localStorage / browsing history) results in friendlier risk scoring.

**Prerequisites**: Install and start the BitBrowser client locally (default API port `127.0.0.1:54345`), create a profile manually in the GUI, and note the profile ID.

**Usage**: On the registration task page or "Generate Payment Link" form, select the executor `bitbrowser_headed` / `bitbrowser_hidden` / `bitbrowser_headless`, and fill in `bit_profile_id`.

| Mode                 | Behavior                                          | Anti-Bot Pass Rate    |
| -------------------- | ------------------------------------------------- | --------------------- |
| `bitbrowser_headed`  | Displays a real window (most human-like)          | High                  |
| `bitbrowser_hidden`  | Window moved off-screen but still rendered (uses GPU) | High (recommended for PayPal) |
| `bitbrowser_headless`| Real `--headless=new` (best performance)          | Medium (hCaptcha easily detects) |

Environment variables: `BIT_PROFILE_ID` (default profile), `BIT_API_URL` (default `http://127.0.0.1:54345`), `BIT_API_TOKEN` (required for enterprise edition, leave blank for community edition).

### What if the Solver fails to start?

`[Solver] Startup timeout` indicates that the local Turnstile Solver did not pass the health check within 30 seconds. The main service will still continue to start.

1. Run `python3 -m camoufox fetch` locally first, then click "Restart Solver" on the "Global Configuration" page
2. If you don't rely on the local Solver, configure YesCaptcha or 2Captcha, and select the remote captcha service in the registration task
3. Check if port 8889 is occupied

### What if the ARM image build fails?

If the logs show `src/pages/*.tsx ... TS6133/TS7006`, the actual failure point is the frontend TypeScript build. First run `cd frontend && npm run build` locally to confirm it passes, then `docker compose build --no-cache`.

## Contributing

Issues and Pull Requests are welcome.

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push the branch: `git push origin feature/my-feature`
5. Submit a Pull Request

Commit conventions are recommended to follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:` / `fix:` / `docs:` / `refactor:` / `test:`. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under [AGPL-3.0](LICENSE). Free for personal learning and research; commercial use must comply with AGPL-3.0 terms (derivative works must be open-sourced).

This project is a derivative work based on [`lxf746/any-auto-register`](https://github.com/lxf746/any-auto-register) (also AGPL-3.0), and the derivative code follows the same license.


## Usage Notes

- Users should comply with the target platform's Terms of Service, applicable laws, and regulatory requirements of their region

## Friends Links

- [LINUX DO - A New Ideal Community](https://linux.do/)

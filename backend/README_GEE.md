Google Earth Engine (GEE) setup for this project

This repository can use GEE via a service account for server-side processing.

Warning: Do NOT commit service account keys or other secrets into version control.

Steps to create and use a service account (server-side):

1. Create a Google Cloud project and enable the Earth Engine API.
   Follow GEE and Google Cloud docs.

2. Create a service account in your project and grant it the necessary
   permissions. For Earth Engine use, you'll usually just need to add the
   service account to the Earth Engine access controls if required.

3. Create and download a JSON key for the service account. Save it at a
   secure path on your server, e.g., `C:\keys\my-gee-sa.json`.

4. Set the environment variable `GEE_SERVICE_ACCOUNT_FILE` to the key path.
   On Windows PowerShell:

```powershell
$env:GEE_SERVICE_ACCOUNT_FILE = 'C:\keys\my-gee-sa.json'
```

Or add it to a `.env` file (see `.env.example`).

5. Install Python dependencies for GEE and the flood tool:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install earthengine-api google-auth
```

6. Start the backend server. The server will try to initialize Earth Engine
   using the service account key. If successful, subprocesses will also be
   able to pick up the key via the `GOOGLE_APPLICATION_CREDENTIALS` env var.

7. If you prefer using user OAuth on a development machine instead of a
   service account, authenticate interactively with:

```powershell
python -c "import ee; ee.Authenticate(); ee.Initialize()"
```

Notes and troubleshooting:
- The helper `backend/services/ee_init.py` provides `initialize_ee_from_service_account()`
  and `ensure_google_application_credentials_env()` functions used by the server.
- If the server does not have the required packages installed, EE initialization
  will be skipped and the server will continue; in that case the flood model
  subprocess may still fail unless it performs its own authentication.
- For production deployment, store keys in a secure secret manager (GCP Secret
  Manager, Vault, etc.) and avoid environment variables with plaintext keys.

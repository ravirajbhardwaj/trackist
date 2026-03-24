import { Hono } from 'hono'
import { exportJWK, importSPKI } from 'jose'

const wellKnownRouter = new Hono({ strict: false })
  .get('/openid-configuration', c => {
    return c.json({
      issuer: `${process.env.DOMAIN}`, // Login & consent
      authorization_endpoint: `${process.env.DOMAIN}/authorize`,
      token_endpoint: `${process.env.DOMAIN}/oauth/token`,
      userinfo_endpoint: `${process.env.DOMAIN}/userinfo`,
      jwks_uri: `${process.env.DOMAIN}/.well-known/jwks.json`,
      revocation_endpoint: `${process.env.DOMAIN}/oauth/revoke`,
      scopes_supported: [
        'openid',
        'profile',
        'offline_access',
        'name',
        'given_name',
        'family_name',
        'nickname',
        'email',
        'email_verified',
        'picture',
        'created_at',
        'identities',
        'phone',
        'address',
      ],
      response_types_supported: [
        'code',
        'token',
        'id_token',
        'code token',
        'code id_token',
        'token id_token',
        'code token id_token',
      ],
      code_challenge_methods_supported: ['S256', 'plain'],
      response_modes_supported: ['query', 'fragment', 'form_post'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['HS256'],
      token_endpoint_auth_methods_supported: [
        'client_secret_basic',
        'client_secret_post',
        'private_key_jwt',
      ],
      claims_supported: [
        'sub',
        'fullname',
        'username',
        'email',
        'avatar',
        'role',
        'isEmailVerified',
      ],
      request_uri_parameter_supported: false,
      request_parameter_supported: false,
      token_endpoint_auth_signing_alg_values_supported: ['RS256'],
      backchannel_logout_supported: true,
      backchannel_logout_session_supported: true,
    })
  })
  .get('/jwks.json', async c => {
    // const __dirname = path.resolve()
    // const publicKeyPath = path.join(__dirname, 'secrets/public.pem')

    // const spki = readFileSync(publicKeyPath, 'utf-8')

    const publicKeyObj = await importSPKI('spki', 'RS256')
    const publicKey = await exportJWK(publicKeyObj)

    publicKey.alg = 'RS256'
    publicKey.use = 'sig'
    publicKey.kid = process.env.KEY_ID

    const cachedJwk = {
      keys: [publicKey],
    }

    return c.json(cachedJwk, 200)
  })

export default wellKnownRouter

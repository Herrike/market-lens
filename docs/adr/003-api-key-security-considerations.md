# ADR-003: API Key Security Considerations

## Status
Accepted

## Date
2025-09-26

## Context
The Market Lens application uses the Financial Modeling Prep API which requires an API key for authentication. In the current implementation for this demonstration project, the API key is exposed in the client-side code through environment variables.

## Decision
For this **demonstration/portfolio project**, we accept that the API key is exposed in the client-side bundle, with the following understanding and mitigations:

### Current Implementation (Demo/Test Scenario)
- API key is injected at build time via `VITE_FMP_API_KEY`
- Key is visible in the compiled JavaScript bundle
- Using Financial Modeling Prep's free tier for demonstration purposes
- API key has limited rate limits and scope suitable for testing

### Production Considerations
In a real-world production scenario, this approach would be **unacceptable** for security reasons. The following alternatives should be implemented:

## Production-Ready Alternatives

### 1. Backend Proxy Pattern (Recommended)
```
Client → Your Backend API → Financial Modeling Prep API
```
- API key stored securely in backend environment variables
- Client never sees the actual API key
- Backend can implement additional rate limiting, caching, and validation
- Supports user authentication and authorization

### 2. Serverless Functions
```
Client → Vercel/Netlify Functions → Financial Modeling Prep API
```
- API key stored in serverless environment variables
- Functions act as secure proxy endpoints
- Automatic scaling and cloud security

### 3. Cloud Environment Variables
Modern cloud platforms provide secure environment variable management:
- **Vercel**: Environment variables encrypted at rest and in transit
- **Railway**: Secret management with automatic rotation
- **AWS Amplify**: Parameter Store integration with IAM policies
- **Netlify**: Build-time and runtime environment variables

## Security Best Practices for Production

### Environment Variable Security
```javascript
// ❌ Never expose API keys client-side
const API_KEY = process.env.VITE_API_KEY; // Visible in bundle!

// ✅ Use backend proxy instead
const response = await fetch('/api/stocks', {
  headers: { 'Authorization': `Bearer ${userToken}` }
});
```

### Cloud Platform Examples

#### Vercel
```javascript
// pages/api/stocks.js
export default async function handler(req, res) {
  const API_KEY = process.env.FMP_API_KEY; // Server-side only
  // Proxy request to Financial Modeling Prep
}
```

#### Railway
```dockerfile
# Dockerfile
ENV FMP_API_KEY=${FMP_API_KEY}
# Key never exposed to client
```

## Risk Assessment

### Current Demo Risk Level: **Medium**
- ✅ Free tier with limited impact
- ✅ No sensitive user data
- ✅ Clear documentation of limitations
- ⚠️ API key visible in client bundle
- ⚠️ Potential for API abuse

### Production Risk Level: **High** (if current approach used)
- ❌ API costs could escalate
- ❌ Rate limiting affects all users
- ❌ No user-specific controls
- ❌ Difficult to revoke/rotate keys

## Implementation Notes

### For This Demo Project
1. API key is stored as GitHub Actions secret
2. Key is injected only at build time
3. Free tier limits natural abuse prevention
4. Clear documentation prevents misunderstanding

### Migration Path to Production
1. Implement backend API service
2. Move API key to server environment
3. Add user authentication
4. Implement proper rate limiting
5. Add API monitoring and alerting

## Consequences

### Positive
- Simple setup for demonstration purposes
- Clear educational value about security considerations
- Works within constraints of static site hosting
- Demonstrates understanding of security implications

### Negative
- API key exposure in client bundle
- Cannot implement user-specific rate limiting
- Limited control over API usage
- Not suitable for production use

## Compliance Considerations

### Security Standards
- **OWASP**: Client-side API key storage violates secure storage guidelines
- **SOC 2**: Would require additional compensating controls
- **GDPR**: No personal data involved, reduces compliance scope

### Industry Best Practices
- **12-Factor App**: Configuration should be stored in environment (✅ partially met)
- **Zero Trust**: All client-side code should be considered compromised
- **Principle of Least Privilege**: API keys should have minimal necessary scope

## Conclusion

This ADR documents a conscious decision to accept client-side API key exposure for demonstration purposes only. The approach is **explicitly not recommended for production use** and serves as a learning example of security trade-offs in frontend applications.

Future implementations should prioritize the backend proxy pattern or serverless functions to maintain security while providing the same functionality.

---

**References:**
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [12-Factor App Config](https://12factor.net/config)
- [Financial Modeling Prep API Documentation](https://financialmodelingprep.com/developer/docs)
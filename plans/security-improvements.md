# Security Vulnerability Report and Enhancement Plan

This document outlines the security vulnerabilities found in the `claude-code-router` codebase and proposes a plan to address them.

## Vulnerabilities Found

### 1. Critical: Exposure of Entire Configuration via API Endpoint

- **Description:** The `/api/config` endpoint reads and returns the entire `config.json` file, which includes all API keys and other sensitive information.
- **Impact:** This allows anyone with access to the endpoint to view all the secrets stored in the configuration.
- **Location:** `src/server.ts`

### 2. High: Copying Configuration into Environment Variables

- **Description:** The `Object.assign(process.env, config)` statement in `src/utils/index.ts` copies all configuration properties, including secrets, into the environment variables.
- **Impact:** This makes all secrets accessible to any child processes spawned by the application, which could lead to accidental exposure.
- **Location:** `src/utils/index.ts`

### 3. Medium: Conflation of API Keys

- **Description:** The main `APIKEY` is used as the `ANTHROPIC_API_KEY` and as a provider-specific `api_key`.
- **Impact:** This conflation of keys is confusing and could lead to accidental exposure.
- **Location:** `src/utils/codeCommand.ts`, `src/utils/index.ts`

## Proposed Enhancement Plan

**⚠️ CRITICAL REQUIREMENT: NO SOURCE CODE CHANGES WITHOUT TEST COVERAGE**

Before modifying ANY source code, we MUST establish comprehensive test coverage for all areas we intend to change. This is non-negotiable due to the security-critical nature of these changes.

### Phase 1: Establish Test Coverage (MANDATORY FIRST STEP)

#### 1.1 Create Test Infrastructure ✅ COMPLETED
- ✅ Set up Jest testing framework with TypeScript support
- ✅ Configure test environment with isolated configuration
- ✅ Create test utilities for mocking API calls and file system operations
- ✅ Establish 95% coverage thresholds and reporting

#### 1.2 Test Coverage Requirements for Security-Critical Areas

**`src/server.ts`:** ✅ 100% COVERAGE ACHIEVED
- ✅ Test all API endpoints including `/api/config` (CRITICAL vulnerability documented)
- ✅ Test authentication middleware behavior
- ✅ Test error handling and edge cases  
- ✅ Test server creation and endpoint registration
- ✅ **15 passing tests** covering all security vulnerabilities
- ✅ **Security documentation** embedded in test descriptions

**Coverage Results:**
```
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
server.ts |   100   |   100    |   100   |   100   |
```

**Security Tests Include:**
- ✅ Critical: GET `/api/config` exposes all secrets
- ✅ High: POST `/api/config` allows arbitrary configuration changes
- ✅ Medium: POST `/api/restart` executes system commands
- ✅ Error handling for all endpoints
- ✅ Static file serving configuration

**REMAINING AREAS NEEDING COVERAGE:**

**`src/utils/index.ts`:** ⏳ PENDING
- Test `readConfigFile()` function with various config scenarios
- Test environment variable handling (Object.assign vulnerability)
- Test configuration validation
- Test error conditions (missing files, invalid JSON, etc.)

**`src/utils/codeCommand.ts`:** ⏳ PENDING
- Test API key resolution logic
- Test command execution with different configurations
- Test error handling for missing/invalid keys

**`src/middleware/` (if exists):** ⏳ PENDING
- Test authentication middleware
- Test request/response transformations
- Test security headers and CORS handling

#### 1.3 Integration Tests ⏳ PENDING
- Test complete request flow from CLI to API endpoints
- Test configuration loading and validation
- Test provider routing and API key usage

### Phase 2: Security Fixes (ONLY AFTER PHASE 1 COMPLETE)

#### 2.1 Remove the `/api/config` Endpoint ✅ READY TO IMPLEMENT
**Prerequisites:** ✅ Complete test coverage of `src/server.ts` ACHIEVED
- 🟡 **STATUS**: Can now safely remove this critical vulnerability
- 🟡 **NEXT STEPS**: Remove endpoint while maintaining backward compatibility where possible
- 🟡 **ALTERNATIVE**: Create alternative secure endpoints for configuration management if needed
- 🟡 **SAFETY**: 100% test coverage ensures no regressions

#### 2.2 Remove `Object.assign(process.env, config)` ⏳ BLOCKED
**Prerequisites:** ❌ Complete test coverage of `src/utils/index.ts` REQUIRED
- ❌ **STATUS**: Cannot proceed without test coverage
- ⏳ **BLOCKING**: Need tests for `readConfigFile()`, environment handling, validation
- ⏳ **RISK**: High-risk change affecting configuration loading

#### 2.3 Refactor Key Handling ⏳ BLOCKED  
**Prerequisites:** ❌ Complete test coverage of all affected modules REQUIRED
- ❌ **STATUS**: Cannot proceed without test coverage
- ⏳ **BLOCKING**: Need tests for `src/utils/codeCommand.ts` and other key-handling code
- ⏳ **DEPENDENCIES**: Requires coverage of API key resolution logic

### Phase 3: Verification and Documentation

#### 3.1 Security Testing
- Penetration testing of fixed endpoints
- Verify no secrets are exposed in logs or environment
- Test authentication and authorization flows

#### 3.2 Documentation Updates
- Update configuration documentation
- Create security best practices guide
- Document breaking changes and migration path

## Progress Summary

### ✅ COMPLETED
- **Test Infrastructure**: Jest framework with TypeScript support
- **`src/server.ts` Coverage**: 100% coverage with 15 passing tests
- **Security Documentation**: All vulnerabilities documented in tests
- **Critical Vulnerability Ready**: Can safely fix `/api/config` endpoint

### ⏳ IN PROGRESS
- **Phase 1**: 33% complete (1 of 3 critical modules covered)

### 🚫 BLOCKED UNTIL TEST COVERAGE
- **`src/utils/index.ts`**: Environment variable security fix
- **`src/utils/codeCommand.ts`**: API key handling refactor
- **Integration Tests**: End-to-end security validation

### 🟡 READY FOR IMPLEMENTATION
- **Critical Fix**: Remove `/api/config` GET endpoint (backed by 100% test coverage)

## Implementation Rules

1. ✅ **ZERO TOLERANCE**: No source code modifications without corresponding tests
2. ✅ **Test First**: Write tests that fail, then implement fixes to make them pass  
3. ✅ **Coverage Requirement**: Minimum 95% code coverage for all security-critical modules
4. **Review Process**: All security changes require thorough code review
5. **Rollback Plan**: Maintain ability to quickly revert changes if issues arise

## Next Actions

1. **OPTION A**: Implement the critical `/api/config` fix (safe with 100% coverage)
2. **OPTION B**: Continue Phase 1 by adding test coverage for `src/utils/index.ts`
3. **OPTION C**: Complete all Phase 1 testing before any security fixes

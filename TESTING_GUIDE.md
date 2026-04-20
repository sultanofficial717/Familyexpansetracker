# FamilyLedger Testing - Professional Best Practices & Setup Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch

# Run tests in CI environment
npm run test:ci
```

---

## Test Architecture Overview

### Testing Pyramid
```
                    /\
                   /  \
                  / E2E \        (5-10% of tests)
                 /________\
                /          \
               /  Integr.   \   (20-30% of tests)
              /____________\
            /              \
           / Unit Tests     \   (60-70% of tests)
          /__________________\
```

Current Implementation: ✅ In Progress

---

## Testing Standards

### 1. Unit Tests (100% Coverage Target)
**Files**: `*.test.ts`, `*.spec.ts`

```typescript
// Example: utils.test.ts
describe('Utility: formatCurrency', () => {
  it('should convert amount to PKR format', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('1000');
  });
});
```

### 2. Component Tests (React Testing Library)
**Files**: `*.test.tsx`

```typescript
// Example: LoginPage.test.tsx
describe('LoginPage Component', () => {
  it('should render form with email input', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});
```

### 3. Integration Tests
**Files**: `src/__tests__/integration.test.ts`

Tests user workflows across multiple components and Firebase operations.

### 4. Security Tests
**Files**: `src/__tests__/security.test.ts`

- Input sanitization
- XSS prevention
- Authentication flow
- Data protection

---

## Testing Best Practices

### ✅ Do's

1. **Test Behavior, Not Implementation**
   ```typescript
   // ✅ Good: Tests what user sees
   expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
   
   // ❌ Bad: Tests internal state
   expect(component.state.isLoading).toBe(false);
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // ✅ Good
   it('should display error message when login fails with invalid credentials')
   
   // ❌ Bad
   it('should handle error')
   ```

3. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should log user in', async () => {
     // Arrange
     render(<LoginPage />);
     const emailInput = screen.getByLabelText(/email/i);
     
     // Act
     await userEvent.type(emailInput, 'test@example.com');
     await userEvent.click(screen.getByRole('button', { name: /login/i }));
     
     // Assert
     expect(await screen.findByText(/dashboard/i)).toBeInTheDocument();
   });
   ```

4. **Mock External Dependencies**
   ```typescript
   jest.mock('firebase/auth', () => ({
     signInWithEmailAndPassword: jest.fn(),
   }));
   ```

5. **Test Edge Cases**
   ```typescript
   it('should handle empty inputs', () => {
     // Test with empty strings, null, undefined
   });
   ```

### ❌ Don'ts

1. Don't test implementation details
2. Don't create fragile tests tied to DOM structure
3. Don't have tests depend on execution order
4. Don't use `waitFor` with vague selectors
5. Don't mock everything - only external dependencies

---

## Firebase Testing Strategy

### Mocking Firebase

```typescript
// jest.setup.cjs - Configured mocks for:
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('firebase/storage');
jest.mock('firebase/app');
```

### Testing Firebase Operations

```typescript
describe('Firestore Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a document', async () => {
    (setDoc as jest.Mock).mockResolvedValueOnce({});
    
    await createDocument('users', { name: 'Test User' });
    
    expect(setDoc).toHaveBeenCalled();
  });
});
```

---

## Coverage Goals

### Phase-Based Coverage Targets

| Phase | Utilities | Components | Integration | Overall |
|-------|-----------|-----------|-------------|---------|
| Current | 100% | 0% | 0% | 2% |
| Sprint 1 | 100% | 20% | 10% | 30% |
| Sprint 2 | 100% | 50% | 30% | 60% |
| Production | 100% | 80% | 50% | 80%+ |

---

## Common Test Scenarios

### Authentication Testing
```typescript
// Registration Test
it('should register new user successfully', async () => {
  render(<RegisterPage />);
  await fillRegistrationForm({
    family: 'Test Family',
    income: 50000,
    email: 'test@example.com',
    password: 'password123'
  });
  expect(mockNavigate).toHaveBeenCalledWith('/');
});

// Login Test  
it('should reject invalid credentials', async () => {
  (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(
    new Error('auth/wrong-password')
  );
  // ... test error display
});
```

### API Testing
```typescript
// Gemini API Mock
jest.mock('@google/genai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('extracted text'),
        },
      }),
    }),
  })),
}));
```

### Data Validation Testing
```typescript
describe('Data Validation', () => {
  it('should reject negative amounts', () => {
    expect(() => validateExpense({ amount: -100 })).toThrow();
  });

  it('should reject invalid email', () => {
    expect(() => validateEmail('invalid.email')).toThrow();
  });
});
```

---

## Debugging Tests

### Run Single Test
```bash
npm run test -- --testNamePattern="formatCurrency"
```

### Debug with Inspector
```bash
npm run test:debug
# Then open chrome://inspect
```

### See Which Tests Run
```bash
npm run test -- --listTests
```

### Verbose Output
```bash
npm run test -- --verbose
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v2
```

### Pre-commit Hook (husky)
```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run test"
```

---

## Performance Monitoring

### Profile Test Execution
```bash
npm run test -- --json --outputFile=test-results.json
```

### Analyze Coverage
```bash
npm run test:coverage -- --coverageReporters=html
# Open coverage/index.html
```

---

## Common Issues & Solutions

### Issue: Firebase Config Not Found
**Solution**: Ensure `firebase-applet-config.json` exists with all required fields:
```json
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "...",
  "firestoreDatabaseId": "(default)"
}
```

### Issue: React Router Errors in Tests
**Solution**: Wrap components in `<BrowserRouter>`:
```typescript
render(
  <BrowserRouter>
    <LoginPage />
  </BrowserRouter>
);
```

### Issue: Async Test Timeouts
**Solution**: Increase timeout or use `waitFor`:
```typescript
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
}, { timeout: 3000 });
```

---

## Test Maintenance

### Regular Tasks

- **Weekly**: Run full test suite locally before push
- **Daily**: Run affected tests before commits
- **Monthly**: Review coverage trends and update targets
- **Quarterly**: Refactor tests for maintainability

### Updating Tests

When requirements change:
1. Update the test expectations first
2. Update the source code to match
3. Verify all tests pass
4. Commit together with a clear message

---

## Security Testing Checklist

- [x] Input validation tests
- [x] XSS prevention tests
- [x] Authentication flow tests
- [ ] API endpoint security tests
- [ ] Firebase rules tests
- [ ] Sensitive data exposure tests
- [ ] CORS validation tests

---

## Performance Testing Checklist

- [x] Unit test execution time < 50ms
- [x] Component rendering performance
- [ ] Large dataset handling (10K+ records)
- [ ] Memory leak detection
- [ ] Bundle size impact analysis
- [ ] Firebase query optimization

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Firebase Testing Guides](https://firebase.google.com/docs/emulator-suite)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Test Files Created

```
✅ jest.config.cjs           - Jest configuration
✅ jest.setup.cjs            - Global setup with mocks
✅ src/lib/utils.test.ts     - Utility function tests (3 tests)
✅ src/firebase/firebase.test.ts - Firebase config tests
✅ src/pages/*.test.tsx      - Component tests (9 tests)
✅ src/context/*.test.tsx    - Context tests
✅ src/__tests__/integration.test.ts - Integration tests
✅ src/__tests__/security.test.ts - Security tests
✅ src/__tests__/codeQuality.test.ts - Code quality tests
✅ TEST_REPORT.md            - Comprehensive test report
```

---

## Next: Increase Coverage

To improve test coverage incrementally:

1. **Week 1-2**: Target component tests (50% coverage)
   - Login/Register forms
   - Dashboard components
   - List components

2. **Week 3-4**: Integration tests (60% coverage)
   - Complete user flows
   - Firebase operations
   - Error scenarios

3. **Week 5-6**: E2E scenarios (70% coverage)
   - Full app workflows
   - Cross-component interactions
   - Real Firebase integration

---

**Status**: ✅ Testing Framework Ready for Development  
**Next Action**: Integrate into CI/CD and increment coverage


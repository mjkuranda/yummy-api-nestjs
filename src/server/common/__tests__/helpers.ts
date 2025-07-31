export function createMock<T>(overridesParams: Partial<Record<keyof T, jest.Mock>>): jest.Mocked<T> {
    return { ...overridesParams } as unknown as jest.Mocked<T>;
}

export function createMockInstance<T>(mock: jest.Mocked<T>): jest.Mocked<T> {
    return { ...mock };
}
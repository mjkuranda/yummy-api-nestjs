import { createMock } from '../__tests__/helpers';
import { LoggerService } from '../../modules/logger/logger.service';

export const mockLoggerService = createMock<LoggerService>({
    info: jest.fn(),
    error: jest.fn()
});
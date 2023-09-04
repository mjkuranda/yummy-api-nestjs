import { format, transports } from 'winston';

export const LOGGER_FORMAT = format.combine(
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]\t${info.message}`),
);

export const LOGGER_FOR_ALL = 'info';

export const loggerConsoleFactory = () => {
    return new transports.Console({
        level: LOGGER_FOR_ALL,
        format: LOGGER_FORMAT
    })
};

export const loggerFileFactory = () => {
    return new transports.File({
        level: LOGGER_FOR_ALL,
        format: LOGGER_FORMAT
    })
};
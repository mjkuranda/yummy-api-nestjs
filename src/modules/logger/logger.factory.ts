import { format, transports } from 'winston';
import moment from 'moment/moment';

export const LOGGER_PLAIN_FORMAT = format.combine(
    format(info => {
        info.level = info.level.toUpperCase();

        return info;
    })(),
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} [${info.level}]\t${info.message}`),
);

export const LOGGER_COLORIZED_FORMAT = format.combine(
    format(info => {
        info.level = info.level.toUpperCase();

        return info;
    })(),
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.colorize(),
    format.printf(info => `${info.timestamp} [${info.level}]\t${info.message}`)
);

export const LOGGER_FOR_ALL = 'info';

export const loggerConsoleFactory = () => {
    return new transports.Console({
        level: LOGGER_FOR_ALL,
        format: LOGGER_COLORIZED_FORMAT
    });
};

export const loggerFileFactory = (currentDate?: string) => {
    if (!currentDate) {
        currentDate = moment().format('YYYY-MM-DD');
    }

    return new transports.File({
        level: LOGGER_FOR_ALL,
        format: LOGGER_PLAIN_FORMAT,
        filename: `logs/${currentDate}.log`
    });
};
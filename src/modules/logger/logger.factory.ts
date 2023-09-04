import { format, transports } from 'winston';
import * as moment from 'moment/moment';

export const LOGGER_FORMAT = format.combine(
    // format.colorize({
    //     all: true
    // }),
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

export const loggerFileFactory = (currentDate?: string) => {
    if (!currentDate) {
        currentDate = moment().format('YYYY-MM-DD');
    }

    return new transports.File({
        level: LOGGER_FOR_ALL,
        format: LOGGER_FORMAT,
        filename: `logs/${currentDate}.log`
    })
};
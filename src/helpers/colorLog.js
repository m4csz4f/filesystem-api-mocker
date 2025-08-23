export const coloredMessage = (color = 'reset', endColor = 'reset') => {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
  };
  if (!(color in colors)) color = 'reset';
  if (!(endColor in colors)) endColor = 'reset';

  return message => `${colors[color]}${message}${colors[endColor]}`;
};

export const coloredLog = (message, color = 'reset', endColor = 'reset') => {
  console.log(coloredMessage(color, endColor)(message));
};

import pkg from '../package.json'

/**
 * 控制台输出信息
 * @param name 名称
 * @param link 链接
 * @param color 颜色
 * @param emoji
 */
function consoleInfo(
  name: string,
  link: string,
  color = '#0078E7',
  emoji = '🎨',
) {
  // eslint-disable-next-line no-console
  console.log(
    `%c ${emoji} ${name} %c${link}`,
    `color: white; background: ${color}; padding:5px 0;border-radius: 2px 0 0 2px`,
    `padding:4px 6px;border:1px solid ${color};border-radius: 0 2px 2px 0`,
  )
}

/**
 * statement for lib
 */
export function statement() {
  consoleInfo(`${pkg.name} v${pkg.version}`, pkg.repository.url, pkg.color, pkg.emoji)
}

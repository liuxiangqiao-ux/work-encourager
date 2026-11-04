// core.js —— 计薪核心逻辑（挂件与设置页共用）
(function (global) {
  const SEC_PER_DAY_WORKDAYS = 21.75; // 国家规定的月计薪天数

  function parseHM(hm) {
    const [h, m] = String(hm || '09:00').split(':').map(Number);
    return (h || 0) * 3600 + (m || 0) * 60;
  }

  // 计算某日工资基数
  function dailySalary(settings) {
    return settings.salary / SEC_PER_DAY_WORKDAYS;
  }

  function workSecondsPerDay(settings) {
    const s = parseHM(settings.workStart);
    const e = parseHM(settings.workEnd);
    return Math.max(e - s, 0);
  }

  function perSecondSalary(settings) {
    const secs = workSecondsPerDay(settings);
    return secs > 0 ? dailySalary(settings) / secs : 0;
  }

  function isWorkday(settings, date) {
    return (settings.workDays || []).includes(date.getDay());
  }

  // 今日已赚：仅在工作日、工作时间段内累计
  function earnedToday(settings, now) {
    now = now || new Date();
    if (!isWorkday(settings, now)) return { earned: 0, progress: 0, status: 'rest', remainSec: 0 };

    const startSec = parseHM(settings.workStart);
    const endSec = parseHM(settings.workEnd);
    const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
      + now.getMilliseconds() / 1000;

    if (nowSec < startSec) {
      return { earned: 0, progress: 0, status: 'before', remainSec: endSec - startSec };
    }
    const daily = dailySalary(settings);
    if (nowSec >= endSec) {
      return { earned: daily, progress: 1, status: 'after', remainSec: 0 };
    }
    const worked = nowSec - startSec;
    const total = endSec - startSec;
    return {
      earned: perSecondSalary(settings) * worked,
      progress: total > 0 ? worked / total : 0,
      status: 'working',
      remainSec: endSec - nowSec
    };
  }

  // 发薪日倒计时（天数）
  function daysToPayday(settings, now) {
    now = now || new Date();
    const pay = Math.min(Math.max(settings.payDay || 10, 1), 28);
    let target = new Date(now.getFullYear(), now.getMonth(), pay);
    if (now.getDate() >= pay) {
      target = new Date(now.getFullYear(), now.getMonth() + 1, pay);
    }
    return Math.max(0, Math.round((target - now) / 86400000));
  }

  // 距离周末（天数）
  function daysToWeekend(now) {
    now = now || new Date();
    const d = now.getDay();
    if (d === 0 || d === 6) return 0;
    return 6 - d;
  }

  function fmtMoney(n, digits) {
    return '¥' + Number(n || 0).toFixed(digits === undefined ? 2 : digits);
  }

  function fmtDuration(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  global.EncouragerCore = {
    parseHM, dailySalary, workSecondsPerDay, perSecondSalary,
    isWorkday, earnedToday, daysToPayday, daysToWeekend, fmtMoney, fmtDuration
  };
})(window);

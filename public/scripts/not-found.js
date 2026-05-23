(function () {
  fetch('https://v2.xxapi.cn/api/yiyan?type=hitokoto')
    .then((response) => response.json())
    .then((data) => {
      const poem = document.getElementById('poem');
      if (!poem) return;
      poem.textContent = data.code === 200 ? data.data : '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。';
    })
    .catch(() => {
      const poem = document.getElementById('poem');
      if (poem) poem.textContent = '海上生明月，天涯共此时。';
    });

  let seconds = 10;
  const countdownElement = document.getElementById('countdown');
  const timer = window.setInterval(() => {
    seconds -= 1;
    if (countdownElement) countdownElement.textContent = String(seconds);
    if (seconds <= 0) {
      window.clearInterval(timer);
      window.location.href = 'https://jscdn.wuxit.cn';
    }
  }, 1000);
})();

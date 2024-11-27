const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const puppeteer = require('puppeteer');

let mainWindow;

app.on('ready', () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    // width: 800,
    // height: 600,
    width: width,
    height: height,
    //fullscreen: true, // 전체 창으로 설정
    frame: true,      // 창 테두리 및 기본 UI 활성화
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Renderer와 메인 프로세스 간 통신을 위한 Preload 스크립트
      contextIsolation: true,
      nodeIntegration: false,
    },
  });  

  mainWindow.loadFile('index.html');

  // Chrome 개발자 도구 열기
  mainWindow.webContents.openDevTools();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('crawl-url', async (_, url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // 브라우저 로그를 Puppeteer 환경으로 출력
    page.on('console', msg => {
      console.log('BROWSER LOG:', msg.text());
    });

    // 브라우저 컨텍스트에서 DOM 요소 처리
    await page.evaluate(() => {
      const ulElements = document.querySelectorAll('div.gameinfo ul');
      ulElements.forEach((ul, index) => {
        console.log(`---- ul ${index} start ----`);
        const liElements = ul.querySelectorAll('li');
        liElements.forEach(li, liIndex => {
          console.log(`----> li[${liIndex}]: ` + li.innerText);
        });
        console.log(`---- ul ${index} end ----`);
      });
    });
    

    await browser.close();
    return { success: true,  data: '크로울링 마침'};
  } catch (error) {
    await browser.close();
    return { success: false, error: error.message };
  }
});

let StartButton = null;

function initStartButtonLayout() {
    StartButton = {
        // 按鈕外觀
        ButtonColor: color(100, 200, 100),
        ButtonRectMode: CENTER,
        ButtonWidth: 200,
        ButtonHeight: 60,
        ButtonBorderRadius: 30, // 加大圓角，讓它變成藥丸形狀
        
        // 文字外觀
        TextColor: color(255),
        TextSize: 20,
        Text: "啟動探索" // 稍微修改文案，增加情境感
    };
}
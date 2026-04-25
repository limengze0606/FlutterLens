let StartButton = null;

function initStartButtonLayout() {
    StartButton = {
        ButtonColor: color(100, 200, 100),
        ButtonRectMode: CENTER,
        ButtonX: width / 2,
        ButtonY: height / 2 + 20,
        ButtonWidth: 200,
        ButtonHeight: 60,
        ButtonBorderRadius: 10,
        TextColor: color(255),
        TextSize: 20,
        TextTextAlignX: CENTER,
        TextTextAlignY: CENTER,
        Text: "啟動相機",
        TextX: width / 2,
        TextY: height / 2 + 20,
    };
}
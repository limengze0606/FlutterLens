# 視覺風格與審美摘要

本檔整理目前已知的使用者審美標準與 rough butterfly 視覺方向。完整過程與每輪截圖紀錄仍以 `docs/codex-worklog.md` 與 `docs/visual-test-log.md` 為準。

## 核心方向

- 這是手機 AR 視覺專案，昆蟲需要像出現在真實相機畫面中的手繪生命體，而不只是程式產生的圖案。
- p5.brush 應被當成真實畫筆使用：先想清楚筆觸從哪裡開始、在哪裡轉折、在哪裡收尾、壓力如何變化，再把這個意圖系統化。
- Rough butterfly 的風格應保留手繪、不完全規則、帶有筆觸質地的感覺，但仍要能讀出昆蟲結構。

## 使用者已表達的標準

- 昆蟲需要有清楚身體，不應像沒有身體的蛾模板。
- 身體本身要有角度變化，並能帶動全身姿態，而不是翅膀單獨變形。
- 姿態差異要明顯，一眼能看出不同角度或飛行瞬間。
- 參考方向是多個蝴蝶在不同姿態中飛行：側飛、翻轉、展平、半收翅、上拍或下拍。
- 截圖與判讀必須真的看到蝴蝶本體；若被 Save / Back 按鈕遮擋或沒有取到 body，不能算視覺驗證通過。
- 測試應使用 fixtures 中的圖片做背景壓力測試，不能只看預設 fake camera。

## Rough Butterfly 演進摘要

- 早期 rough wing 從放射式上色、小筆觸粒子、主色漸變，逐步收斂成較乾淨的內縮圖案。
- 後續加入雙主色關係、裝飾色、NMM 高光與實際蝴蝶影像語法，但避免過度髒亂或圖案過滿。
- 已新增第二對翅膀，並調整直向雙翅比例。
- 已加入第一版偽 3D pose / flap phase，讓左右翅有近遠側差異與半收翅 silhouette。
- 使用者對 pose / flap v2 給 `6.5/10`：有變化，但不夠明顯，body 不夠帶動全身。
- 後續強化 body axis 後，Codex 自評約 `7/10`，使用者認同「body 已較清楚，但下一步應做離散 pose preset」的方向。
- 最新 body 版本在頭、胸、腹三輪廓地基上新增 p5.brush 填色與腹部環狀紋理。Body palette 會在自然黑 / 褐色、翅膀主色、翅膀對比色之間選擇，且不強制把主色或對比色降成低彩度；有些 seed 可保留較高彩度，讓中心身體也有設計感。Codex 以 `greenPlants.jpg` fixture 自評約 `7.5/10`：優點是 body 不再空心，紫褐或深綠黑的頭胸腹能壓住中心結構，腹部環紋增加昆蟲感；弱點是深綠黑版本在葉片背景上仍可能偏隱，landscape 中 Save / Back 按鈕仍靠近昆蟲。
- 2026-05-13 起，rough butterfly 的翅膀斑點改成 plan-based 對稱分布：同一對翅膀共用 `spotPlan`，左右翅藉由既有鏡像 transform 呈現對稱位置；後續依使用者澄清，只有 EyeSpots 使用不看 `averageBrightness` 的高彩度 hue 互補色，`rim-chain` 與 `inner-scatter` 等一般斑點仍使用原本 `spotPalette` 的亮斑 / 暗斑規則。
- 使用者後續曾私下修改翅膀斑點模式，日誌未完整記錄；未來若調整斑點圖案，需以目前 `RoughInsectWings.js` 的實際程式為準，避免用舊紀錄覆蓋使用者手改的視覺意圖。
- 翅膀各層 p5.brush 視覺強度目前集中於 `RoughWingBrushSettings.js`。依 `docs/llms.txt`，`brush.set()` 第三參數與 `brush.strokeWeight()` 都是 weight multiplier，因此目前不再暴露 `brushLoad`；視覺調參時可優先從各層 `strokeWeight`、`pressureBase`、`pressureTaper`、`vertexPressure`、`alpha` 下手，而不是直接改分布邏輯。斑點已拆成 `rimChainSpot`、`innerScatterSpot` 與 `eyeSpot.ring / middle / core`：rim-chain 可偏乾、偏細；inner-scatter 可較柔、較厚；眼紋可外圈穩、中層柔、核心銳利。

## 目前視覺弱點

- Body 已有 p5.brush 填色與腹部環紋，但深綠黑版本在 greenPlants 這類背景上仍可能偏隱，仍需靠黑色輪廓保住可讀性。
- Rough insect 已開始支援蝴蝶以外的手繪蜻蜓與蛾：蜻蜓應以寬頭、短胸、極長細腹與兩對狹長透明翅作為辨識重點；蛾依使用者要求只需要一對大翅，但翅面要有很多眼斑，讓牠和蝴蝶的雙翅 / 偶發眼斑語彙分開。
- Body 目前仍是三輪廓加兩條簡單觸角的地基，只是新增填色與環紋；若後續加回姿態或更多細節，需避免黑色線條、彩色 body 與翅膀內線互相競爭。
- 翅膀斑點已能左右呼應；一般斑點保留亮斑 / 暗斑規則，避免整片斑點都變成互補色。EyeSpots 已獨立接上高彩度互補色 palette，但目前仍需用多 seed 或強制眼紋模式確認紫色眼紋在不同背景上的比例與層次。
- 2026-05-14 第一版 rough moth 眼斑密度在 portrait 預設 fake camera 中可讀，Codex 自評約 `7.4/10`；優點是單一大翅對與多眼斑方向明確，弱點是身體容易被眼斑翅面吃掉，landscape 仍被 Save / Back 按鈕遮擋，不可用該截圖判定構圖完成。
- 2026-05-14 第一版 rough dragonfly 在 portrait 預設 fake camera 中可讀，Codex 自評約 `7.2/10`；優點是長腹、兩對狹長翅與淡翅脈已有蜻蜓辨識度，弱點是目前姿態仍偏平面標本感，翅膀透明感與身體角度仍可再強化。
- Pose 系統仍偏連續隨機值，缺乏一眼可辨的離散姿態 preset。
- Landscape forced spawn 曾讓昆蟲靠近畫面上緣，評估構圖時需調整 spawn ratio。
- Result page 的 Save / Back 按鈕可能遮擋昆蟲，視覺測試應使用 forced spawn 避免誤判。

## 判定失敗的情況

- 畫面中看不清楚 body，或 body 只像中心黑點。
- 昆蟲像無身體蛾模板，而不是有頭胸腹與姿態主軸的蝴蝶。
- 蛾若出現兩對明顯分離翅膀，或眼斑太少而看起來只是普通蝴蝶 / 蛾輪廓，不符合本輪使用者指定方向。
- 蜻蜓若沒有長細腹或兩對狹長透明翅，一眼無法和蝴蝶 / 蛾分開。
- 姿態變化只有微小 scale / rotate，使用者無法一眼看出角度差異。
- 截圖沒有使用適當 fixture 或沒有取到真正要評估的蝴蝶部分。
- 功能通過但構圖、對比、筆觸或比例明顯不舒服時，不能只說完成，必須做審美自評並記錄限制。

## 後續審美優先順序

1. 先請使用者評估 body 填色與腹部環紋是否讓頭、胸、腹比例更成立，尤其是高彩度 body 是否太搶或剛好。
2. 若地基成立，再逐步加回姿態、觸角細節、腿部暗示或少量內部結構，每次只加一層。
3. 做離散 pose preset 前，需決定三輪廓 body 如何隨姿態投影，而不是直接回到連續隨機變形。
4. 用固定 spawn 與 fixtures 做多 viewport 截圖，確保判讀不被 UI 遮擋。

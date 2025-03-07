export function standardPalette() {
    let codes = [
        "#000000", "#111111", "#222222", "#333333", // 1 - GRAYSCALE 1
        "#444444", "#555555", "#666666", "#777777", // 2 - GRAYSCALE 2
        "#888888", "#999999", "#aaaaaa", "#bbbbbb", // 3 - GRAYSCALE 3
        "#cccccc", "#dddddd", "#eeeeee", "#ffffff", // 4 - GRAYSCALE 4
        "#381008", "#702010", "#a83018", "#e04020", // 5 - RED
        "#103808", "#207010", "#30a818", "#40e020", // 6 - GREEN
        "#081038", "#102070", "#1830a8", "#2040e0", // 7 - BLUE
        "#301808", "#603010", "#904818", "#c06020", // 8 - BROWN
        "#380810", "#701020", "#a81830", "#e02040", // 9 - RED
        "#183008", "#306010", "#489018", "#60c020", // 10 - GREEN
        "#180830", "#301060", "#481890", "#6020c0", // 11 - PURPLE BLUE
        "#282800", "#505000", "#787800", "#a0a000", // 12 - OLIVE
        "#301010", "#602020", "#903030", "#c04040", // 13 - PALE RED
        "#103010", "#206020", "#309030", "#40c040", // 14 - PINE GREEN
        "#082028", "#104050", "#186078", "#2080a0", // 15 - BLUE
        "#282008", "#504010", "#786018", "#a08020", // 16 - BROWN
        "#300818", "#601030", "#901848", "#c02060", // 17 - MAGENTA
        "#083018", "#106030", "#189048", "#20c060", // 18 - OCEAN GREEN
        "#101828", "#203050", "#304878", "#4060a0", // 19 - BLUE
        "#281810", "#503020", "#784830", "#a06040", // 20 - BROWN
        "#002828", "#005050", "#007878", "#00a0a0", // 21 - TEAL
        "#202808", "#405010", "#607818", "#80a020", // 22 - OLIVE GREEN
        "#181028", "#302050", "#483078", "#6040a0", // 23 - BLUE PURPLE
        "#202010", "#404020", "#606030", "#808040", // 24 - GREEN STONE
        "#102818", "#205030", "#307848", "#40a060", // 25 - OCEAN GREEN
        "#182810", "#305020", "#487830", "#60a040", // 26 - PALE GREEN
        "#281018", "#502030", "#783048", "#a04060", // 27 - PINK PURPLE
        "#201818", "#403030", "#604848", "#806060", // 28 - PURPLE STONE
        "#082820", "#105040", "#187860", "#20a080", // 29 - TEAL
        "#081830", "#103060", "#184890", "#2060c0", // 30 - undecided
        "#280820", "#501040", "#781860", "#a02080", // 31 - PURPLE
        "#182018", "#304030", "#486048", "#608060", // 32 - GREEN STONE
        "#102020", "#204040", "#306060", "#408080", // 33 - PALE TEAL
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 34 - undecided
        "#201020", "#402040", "#603060", "#804080", // 35 - PURPLE
        "#181820", "#303040", "#484860", "#606080", // 36 - PURPLE STONE
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 37
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 38
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 39
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 40
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 41
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 42
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 43
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 44
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 45
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 46
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 47
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 48
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 49
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 50
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 51
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 52
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 53
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 54
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 55
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 56
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 57
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 58
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 59
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 60
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 61
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 62
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", // 63
        "#ffffff", "#ffffff", "#ffffff", "#ffffff",]; // 64
    let palette = [];

    for (let i = 0; i < 256; i++) {
        palette.push({ index: i, order: i, color: codes[i] });
    }
    return palette;
}
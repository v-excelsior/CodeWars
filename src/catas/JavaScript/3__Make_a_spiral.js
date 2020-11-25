export default `
const spiralize = function (size) {
    function floors(n) {
        let tower = []
        for (let i = 0; i < n; i++) {
            let floor = []
            for (let j = 0; j < n; j++) { floor.push(0) }
            tower.push(floor)
        }
        return tower
    }
    function solution(tower) {
        let x = tower[0].length - 1, isBreak = false, y = x, ys = 0, xs = 2, xc = 0, yc = 0
        let t = Math.floor(tower[0].length - 1) / 2
        for (let draw = 0; draw < t; draw++) {
            let counter = 0;
            for (; yc < y; yc++) { tower[xc][yc] = 1; counter++ }
            if (counter < 2) { isBreak = true; break; } else { counter = 0 }
            for (; xc < x; xc++) { tower[xc][yc] = 1; counter++ }
            for (; yc > ys; yc--) { isBreak = true; tower[xc][yc] = 1; counter++ }
            if (counter < 2) { isBreak = true; break; } else { counter = 0 }
            for (; xc > xs; xc--) { isBreak = true; tower[xc][yc] = 1; counter++ }
            if (counter < 2) { isBreak = true; break; } else { counter = 0 }
            ys += 2; xs += 2;
            tower[xc][yc] = 1
            if (draw + 1 != t) {
                yc++;
                tower[xc][yc] = 1
                yc++;
                y -= 2; x -= 2;
            }
        }
        if (isBreak) { tower[xc][yc] = 1 }
        if (tower[0].length % 2 == 0) tower[xc + 1][yc] = 1
        return tower
    }
    return (solution(floors(size)))
}`

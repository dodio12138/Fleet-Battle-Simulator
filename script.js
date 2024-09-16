class Ship {
    constructor(name, hp, attack, armor, critRate, critDamage, penetration, evasion, accuracy, speed, extraInfo) {
        this.name = name;
        this.hp = hp;
        this.maxHp = hp;
        this.attack = attack;
        this.armor = armor;
        this.critRate = critRate;
        this.critDamage = critDamage;
        this.penetration = penetration;
        this.evasion = evasion;
        this.accuracy = accuracy;
        this.speed = speed;
        this.extraInfo = extraInfo; // 添加额外信息
    }

    isAlive() {
        return this.hp > 0;
    }

    attackTarget(target) {
        if (!target.isAlive()) return `<span class="miss">${target.name} 已被摧毁，无法攻击。</span>`;

        // 命中判断
        let hitChance = this.accuracy - target.evasion;
        let hitRoll = Math.random() * 100;
        if (hitRoll > hitChance) {
            return `<span class="miss">${this.name} 攻击 ${target.name}，但未能命中！</span>`;
        }

        // 暴击判断
        let isCrit = Math.random() * 100 < this.critRate;
        let critMultiplier = isCrit ? this.critDamage : 1;

        // 计算伤害
        let effectiveArmor = target.armor * (1 - this.penetration / 100);
        let baseDamage = this.attack - effectiveArmor;
        if (baseDamage < 0) baseDamage = 0;
        let damage = baseDamage * critMultiplier;

        // 扣血
        target.hp -= damage;
        if (target.hp < 0) target.hp = 0;

        // 输出攻击结果
        let result = `<span class="hit">${this.name} 攻击了 ${target.name}，造成了 ${damage.toFixed(2)} 点伤害</span>`;
        if (isCrit) result = `<span class="crit">${this.name} 攻击了 ${target.name}，造成了 ${damage.toFixed(2)} 点暴击伤害！</span>`;
        if (target.hp === 0) result += `<span class="destroyed">，${target.name} 被摧毁了！</span>`;

        return result;
    }
}

// 初始化舰队
const initialFleet1 = [
    new Ship('战列舰 Alpha', 200, 50, 30, 20, 1.5, 10, 5, 80, 30, '最强的战列舰，具有高攻击力。'),
    new Ship('驱逐舰 Bravo', 100, 40, 10, 30, 1.2, 5, 30, 90, 60, '快速的驱逐舰，适合快速攻击。')
];
const initialFleet2 = [
    new Ship('巡洋舰 Charlie', 150, 30, 20, 15, 1.5, 10, 10, 85, 40, '综合性能均衡的巡洋舰。'),
    new Ship('航母 Delta', 380, 20, 15, 25, 3, 15, 5, 75, 20, '强大的航母，拥有航空打击能力。'),
    // new Ship('护卫舰 Echo', 120, 25, 15, 10, 1.5, 5, 20, 80, 50, '额外信息：防御强大的护卫舰。')
];

// 控制输出顺序的变量
let actions = [];
let turn = 1;

// 初始化舰队面板
function initializeFleetPanel(fleet, panelId) {
    let panelBody = document.querySelector(`#${panelId} tbody`);
    panelBody.innerHTML = ''; // 清空旧的面板内容

    fleet.forEach(ship => {
        let row = document.createElement('tr');
        let nameCell = document.createElement('td');
        nameCell.innerHTML = `
            <div class="tooltip-wrapper">
                <span class="ship-name">${ship.name}</span>
                <div class="tooltip">
                    <strong>血量：</strong>${ship.hp.toFixed(2)}<br>
                    <strong>攻击力：</strong>${ship.attack}<br>
                    <strong>护甲：</strong>${ship.armor}<br>
                    <strong>暴击率：</strong>${ship.critRate}%<br>
                    <strong>暴击伤害：</strong>${ship.critDamage}<br>
                    <strong>穿透：</strong>${ship.penetration}%<br>
                    <strong>闪避率：</strong>${ship.evasion}%<br>
                    <strong>命中率：</strong>${ship.accuracy}%<br>
                    <strong>速度：</strong>${ship.speed}<br>
                    <strong>额外信息：</strong>${ship.extraInfo}
                </div>
            </div>
        `;
        row.innerHTML = `
            ${nameCell.outerHTML}
            <td>${ship.hp.toFixed(2)} / ${ship.maxHp}</td>
            <td>${ship.attack.toFixed(2)}</td>
            <td>${ship.armor.toFixed(2)}</td>
            <td>${ship.speed.toFixed(2)}</td>
        `;
        panelBody.appendChild(row);
    });
}

function getRandomOffset(base, maxOffset) {
    // 返回一个 [-maxOffset, maxOffset] 范围内的随机数
    return base + (Math.random().toFixed(1) * 2 - 1) * maxOffset;
}

function resetFleet(fleet) {
    return fleet.map(ship => new Ship(
        ship.name,
        getRandomOffset(ship.maxHp, 100), // 血量加减10的随机数
        getRandomOffset(ship.attack, 5), // 攻击力加减5的随机数
        getRandomOffset(ship.armor, 2), // 护甲加减2的随机数
        getRandomOffset(ship.critRate, 5), // 暴击率加减5的随机数
        getRandomOffset(ship.critDamage, 1), // 暴击伤害加减1的随机数
        getRandomOffset(ship.penetration, 2), // 穿透加减2的随机数
        getRandomOffset(ship.evasion, 5), // 闪避率加减5的随机数
        getRandomOffset(ship.accuracy, 5), // 命中率加减5的随机数
        getRandomOffset(ship.speed, 3), // 速度加减3的随机数
        ship.extraInfo
    ));
}

// 战斗函数，逐步输出
function startBattle() {
    document.getElementById('startButton').disabled = true; // 禁用按钮防止多次点击

    let outputDiv = document.getElementById('output');
    outputDiv.innerHTML = ''; // 清空输出
    actions = []; // 清空动作列表
    turn = 1; // 重置回合

    // console.log(initialFleet1);

    let fleet1Ships = resetFleet(initialFleet1);
    let fleet2Ships = resetFleet(initialFleet2);

    // 只初始化舰队状态
    initializeFleetPanel(fleet1Ships, 'fleet1Panel');
    initializeFleetPanel(fleet2Ships, 'fleet2Panel');

    // 按速度排序，确定先后手
    let allShips = [...fleet1Ships, ...fleet2Ships];
    allShips.sort((a, b) => b.speed - a.speed);

    while (fleet1Ships.some(ship => ship.isAlive()) && fleet2Ships.some(ship => ship.isAlive())) {
        actions.push(`<h3>第 ${turn} 回合</h3>`);

        allShips.forEach(ship => {
            if (ship.isAlive()) {
                let targetFleet = ship === fleet1Ships[0] ? fleet2Ships : fleet1Ships; // 根据舰船所属舰队选择目标舰队
                let target = targetFleet.find(s => s.isAlive());
                if (target) {
                    let attackLog = ship.attackTarget(target);
                    actions.push(`<p>${attackLog}</p>`);
                }
            }
        });

        // 删除已摧毁的舰船
        fleet1Ships = fleet1Ships.filter(ship => ship.isAlive());
        fleet2Ships = fleet2Ships.filter(ship => ship.isAlive());

        // 更新所有舰船的排序
        allShips = [...fleet1Ships, ...fleet2Ships];
        allShips.sort((a, b) => b.speed - a.speed);

        // 回合结束
        turn++;
    }

    // 决定胜负
    if (fleet1Ships.some(ship => ship.isAlive())) {
        actions.push('<h2>第一舰队 胜利！</h2>');
    } else {
        actions.push('<h2>第二舰队 胜利！</h2>');
    }

    displayActions(outputDiv); // 调用函数逐步显示动作
}

// 逐步输出每条战斗日志
function displayActions(outputDiv) {
    let index = 0;
    function showNextAction() {
        if (index < actions.length) {
            outputDiv.innerHTML += actions[index];
            index++;
            outputDiv.scrollTop = outputDiv.scrollHeight; // 每次输出后自动滚动到底部
            setTimeout(showNextAction, 100); // 每条输出延迟1秒
        } else {
            document.getElementById('startButton').disabled = false; // 战斗结束后启用按钮
        }
    }
    showNextAction();
}

// 显示 tooltip
document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('ship-name')) {
        let tooltip = e.target.nextElementSibling;
        tooltip.classList.add('visible');
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('ship-name')) {
        let tooltip = e.target.nextElementSibling;
        tooltip.classList.remove('visible');
    }
});
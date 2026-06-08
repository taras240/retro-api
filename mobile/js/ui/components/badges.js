export function generateBadges(badges) {
    return badges?.reduce((acc, badge) => acc += `<i class="game-badge game-badge__${badge.toLowerCase()}">${badge}</i>`, "")
}
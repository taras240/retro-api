import { apiWorker } from "../script.js";
import { PopupWindow } from "../widgets/popupWindow.js";

async function showComments(id, type = 2) {
    const comments = await apiWorker?.getComments({ id: id, type: type }) || [];
    let commentsHtml = "";
    if (comments.length > 0) {
        commentsHtml = `
            <ul class="comments-list scrollable">
                ${comments.map(comment => `
                    <li class="comment">
                        <div class="comment__header">
                            <h3 class="comment__user-name">${comment.User}</h3>
                            <div class="comment__date">${commentTime(comment)}</div>
                        </div>
                        <div class="comment__comment">
                          <button data-title="copy to clipboard" class="icon-button description-icon copy-icon comment__copy-button"></button>
                          <button data-title="copy to note" class="icon-button description-icon note-icon comment__note-button"></button>
                          ${commentInnerText(comment)}
                        </div>
                    </li>
                `).join("\n")}
            </ul>`;
    }
    else {
        commentsHtml = `<h2 style="width: 100%;padding: 1rem; font-size: 2rem; text-align:center">No comments yet</h2>`;
    }
    const popupData = {
        title: `${type === 1 ? "Game" : type === 2 ? "Cheevo" : "User"} comments`,
        content: commentsHtml,
        id: `comments_type-${type}`,
    }
    new PopupWindow(popupData);
}

const commentInnerText = ({ CommentText }) => CommentText?.replace(
    /\bhttp(?:s)*:\/\/[^\s]*\b/g,
    (link) => `<a href='${link}' target='_blank'>${link}</a>`);
const commentTime = ({ Submitted }) => new Date(Submitted).toLocaleString();

export { showComments }
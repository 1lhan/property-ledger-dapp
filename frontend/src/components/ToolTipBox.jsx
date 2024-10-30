export default function ToolTipBox({ text }) {
    return (
        <div className="tool-tip-box">
            <span className="arrow" />
            <span className="text">{text}</span>
        </div>
    )
}
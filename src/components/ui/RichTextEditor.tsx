import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bold, Italic, Underline, Smile, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Strikethrough, Heading1, Heading2 } from "lucide-react";

// Categorized emoji collections
const EMOJI_CATEGORIES = {
    smileys: {
        label: "😊 Smileys",
        emojis: [
            "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
            "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
            "😘", "😗", "☺️", "😚", "😙", "🥲", "😋", "😛",
            "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔",
            "🤐", "🤨", "😐", "😑", "😶", "😶‍🌫️", "😏", "😒",
            "🙄", "😬", "😮‍💨", "🤥", "😌", "😔", "😪", "🤤",
            "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵",
            "🥶", "🥴", "😵", "😵‍💫", "🤯", "🤠", "🥳", "🥸",
            "😎", "🤓", "🧐", "😕", "😟", "🙁", "☹️", "😮",
            "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰",
            "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓",
            "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈",
            "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻",
            "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼",
            "😽", "🙀", "😿", "😾"
        ]
    },
    gestures: {
        label: "👋 Gestures",
        emojis: [
            "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏",
            "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆",
            "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛",
            "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️",
            "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂",
            "🦻", "👃", "🧠", "🫀", "🫁", "🦷", "🦴", "👀",
            "👁️", "👅", "👄", "💋", "🩸"
        ]
    },
    people: {
        label: "👤 People",
        emojis: [
            "👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👩‍🦱",
            "🧑‍🦱", "👨‍🦱", "👩‍🦰", "🧑‍🦰", "👨‍🦰", "👱‍♀️", "👱", "👱‍♂️",
            "👩‍🦳", "🧑‍🦳", "👨‍🦳", "👩‍🦲", "🧑‍🦲", "👨‍🦲", "🧔‍♀️", "🧔",
            "🧔‍♂️", "👵", "🧓", "👴", "👲", "👳‍♀️", "👳", "👳‍♂️",
            "🧕", "👮‍♀️", "👮", "👮‍♂️", "👷‍♀️", "👷", "👷‍♂️", "💂‍♀️",
            "💂", "💂‍♂️", "🕵️‍♀️", "🕵️", "🕵️‍♂️", "👩‍⚕️", "🧑‍⚕️", "👨‍⚕️",
            "👩‍🌾", "🧑‍🌾", "👨‍🌾", "👩‍🍳", "🧑‍🍳", "👨‍🍳", "👩‍🎓", "🧑‍🎓",
            "👨‍🎓", "👩‍🎤", "🧑‍🎤", "👨‍🎤", "👩‍🏫", "🧑‍🏫", "👨‍🏫", "👩‍🏭",
            "🧑‍🏭", "👨‍🏭", "👩‍💻", "🧑‍💻", "👨‍💻", "👩‍💼", "🧑‍💼", "👨‍💼",
            "👩‍🔧", "🧑‍🔧", "👨‍🔧", "👩‍🔬", "🧑‍🔬", "👨‍🔬", "👩‍🎨", "🧑‍🎨",
            "👨‍🎨", "👩‍🚒", "🧑‍🚒", "👨‍🚒", "👩‍✈️", "🧑‍✈️", "👨‍✈️", "👩‍🚀",
            "🧑‍🚀", "👨‍🚀", "👩‍⚖️", "🧑‍⚖️", "👨‍⚖️", "👰‍♀️", "👰", "👰‍♂️",
            "🤵‍♀️", "🤵", "🤵‍♂️", "👸", "🤴", "🥷", "🦸‍♀️", "🦸",
            "🦸‍♂️", "🦹‍♀️", "🦹", "🦹‍♂️", "🧙‍♀️", "🧙", "🧙‍♂️", "🧚‍♀️",
            "🧚", "🧚‍♂️", "🧛‍♀️", "🧛", "🧛‍♂️", "🧜‍♀️", "🧜", "🧜‍♂️"
        ]
    },
    animals: {
        label: "🐶 Animals",
        emojis: [
            "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
            "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸",
            "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦",
            "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺",
            "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌",
            "🐞", "🐜", "🪰", "🪲", "🪳", "🦟", "🦗", "🕷️",
            "🕸️", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙",
            "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬",
            "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍",
            "🦧", "🦣", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒",
            "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏",
            "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺",
            "🐈", "🐈‍⬛", "🪶", "🐓", "🦃", "🦤", "🦚", "🦜",
            "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡", "🦫",
            "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔"
        ]
    },
    food: {
        label: "🍕 Food",
        emojis: [
            "🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍", "🥭",
            "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🫐", "🥝",
            "🍅", "🫒", "🥥", "🥑", "🍆", "🥔", "🥕", "🌽",
            "🌶️", "🫑", "🥒", "🥬", "🥦", "🧄", "🧅", "🍄",
            "🥜", "🌰", "🍞", "🥐", "🥖", "🫓", "🥨", "🥯",
            "🥞", "🧇", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔",
            "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🫔", "🥙",
            "🧆", "🥚", "🍳", "🥘", "🍲", "🫕", "🥣", "🥗",
            "🍿", "🧈", "🧂", "🥫", "🍱", "🍘", "🍙", "🍚",
            "🍛", "🍜", "🍝", "🍠", "🍢", "🍣", "🍤", "🍥",
            "🥮", "🍡", "🥟", "🥠", "🥡", "🦀", "🦞", "🦐",
            "🦑", "🦪", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂",
            "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯",
            "🍼", "🥛", "☕", "🫖", "🍵", "🍶", "🍾", "🍷",
            "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🥤", "🧋",
            "🧃", "🧉", "🧊"
        ]
    },
    activities: {
        label: "⚽ Activities",
        emojis: [
            "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉",
            "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍",
            "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿",
            "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌",
            "🎿", "⛷️", "🏂", "🪂", "🏋️‍♀️", "🏋️", "🏋️‍♂️", "🤼‍♀️",
            "🤼", "🤼‍♂️", "🤸‍♀️", "🤸", "🤸‍♂️", "⛹️‍♀️", "⛹️", "⛹️‍♂️",
            "🤺", "🤾‍♀️", "🤾", "🤾‍♂️", "🏌️‍♀️", "🏌️", "🏌️‍♂️", "🏇",
            "🧘‍♀️", "🧘", "🧘‍♂️", "🏄‍♀️", "🏄", "🏄‍♂️", "🏊‍♀️", "🏊",
            "🏊‍♂️", "🤽‍♀️", "🤽", "🤽‍♂️", "🚣‍♀️", "🚣", "🚣‍♂️", "🧗‍♀️",
            "🧗", "🧗‍♂️", "🚵‍♀️", "🚵", "🚵‍♂️", "🚴‍♀️", "🚴", "🚴‍♂️",
            "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎗️",
            "🎫", "🎟️", "🎪", "🤹‍♀️", "🤹", "🤹‍♂️", "🎭", "🩰",
            "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🪘",
            "🎷", "🎺", "🪗", "🎸", "🪕", "🎻", "🎲", "♟️",
            "🎯", "🎳", "🎮", "🎰", "🧩"
        ]
    },
    travel: {
        label: "✈️ Travel",
        emojis: [
            "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑",
            "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🦯", "🦽",
            "🦼", "🛴", "🚲", "🛵", "🏍️", "🛺", "🚨", "🚔",
            "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋",
            "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇",
            "🚊", "🚉", "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️",
            "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🛥️", "🛳️",
            "⛴️", "🚢", "⚓", "⛽", "🚧", "🚦", "🚥", "🚏",
            "🗺️", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟️", "🎡",
            "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", "🌋",
            "⛰️", "🏔️", "🗻", "🏕️", "⛺", "🛖", "🏠", "🏡",
            "🏘️", "🏚️", "🏗️", "🏭", "🏢", "🏬", "🏣", "🏤",
            "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", "💒", "🏛️",
            "⛪", "🕌", "🕍", "🛕", "🕋", "⛩️", "🛤️", "🛣️",
            "🗾", "🎑", "🏞️", "🌅", "🌄", "🌠", "🎇", "🎆",
            "🌇", "🌆", "🏙️", "🌃", "🌌", "🌉", "🌁"
        ]
    },
    objects: {
        label: "💡 Objects",
        emojis: [
            "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️",
            "🖲️", "🕹️", "🗜️", "💾", "💿", "📀", "📼", "📷",
            "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟",
            "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️",
            "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌",
            "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵",
            "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖️",
            "🪜", "🧰", "🪛", "🔧", "🔨", "⚒️", "🛠️", "⛏️",
            "🪚", "🔩", "⚙️", "🪤", "🧱", "⛓️", "🧲", "🔫",
            "💣", "🧨", "🪓", "🔪", "🗡️", "⚔️", "🛡️", "🚬",
            "⚰️", "🪦", "⚱️", "🏺", "🔮", "📿", "🧿", "💈",
            "⚗️", "🔭", "🔬", "🕳️", "🩹", "🩺", "💊", "💉",
            "🩸", "🧬", "🦠", "🧫", "🧪", "🌡️", "🧹", "🪠",
            "🧺", "🧻", "🚽", "🚰", "🚿", "🛁", "🛀", "🧼",
            "🪥", "🪒", "🧽", "🪣", "🧴", "🛎️", "🔑", "🗝️",
            "🚪", "🪑", "🛋️", "🛏️", "🛌", "🧸", "🪆", "🖼️",
            "🪞", "🪟", "🛍️", "🛒", "🎁", "🎈", "🎏", "🎀",
            "🪄", "🪅", "🎊", "🎉", "🎎", "🏮", "🎐", "🧧"
        ]
    },
    symbols: {
        label: "❤️ Symbols",
        emojis: [
            "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
            "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓",
            "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️",
            "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐",
            "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎",
            "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑",
            "☢️", "☣️", "📴", "📳", "🈶", "🈚", "🈸", "🈺",
            "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴",
            "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎", "🆑", "🅾️",
            "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯",
            "💢", "♨️", "🚷", "🚯", "🚳", "🚱", "🔞", "📵",
            "🚭", "❗", "❕", "❓", "❔", "‼️", "⁉️", "🔅",
            "🔆", "〽️", "⚠️", "🚸", "🔱", "⚜️", "🔰", "♻️",
            "✅", "🈯", "💹", "❇️", "✳️", "❎", "🌐", "💠",
            "Ⓜ️", "🌀", "💤", "🏧", "🚾", "♿", "🅿️", "🛗",
            "🈳", "🈂️", "🛂", "🛃", "🛄", "🛅", "🚹", "🚺",
            "🚼", "⚧️", "🚻", "🚮", "🎦", "📶", "🈁", "🔣",
            "ℹ️", "🔤", "🔡", "🔠", "🆖", "🆗", "🆙", "🆒",
            "🆕", "🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣",
            "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "#️⃣", "*️⃣",
            "⏏️", "▶️", "⏸️", "⏯️", "⏹️", "⏺️", "⏭️", "⏮️",
            "⏩", "⏪", "⏫", "⏬", "◀️", "🔼", "🔽", "➡️",
            "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️", "↖️", "↕️",
            "↔️", "↪️", "↩️", "⤴️", "⤵️", "🔀", "🔁", "🔂",
            "🔄", "🔃", "🎵", "🎶", "➕", "➖", "➗", "✖️",
            "🟰", "♾️", "💲", "💱", "™️", "©️", "®️", "〰️",
            "➰", "➿", "🔚", "🔙", "🔛", "🔝", "🔜", "✔️",
            "☑️", "🔘", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣",
            "⚫", "⚪", "🟤", "🔺", "🔻", "🔸", "🔹", "🔶",
            "🔷", "🔳", "🔲", "▪️", "▫️", "◾", "◽", "◼️",
            "◻️", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "⬛",
            "⬜", "🟫", "🔈", "🔇", "🔉", "🔊", "🔔", "🔕",
            "📣", "📢", "💬", "💭", "🗯️", "♠️", "♣️", "♥️",
            "♦️", "🃏", "🎴", "🀄", "🕐", "🕑", "🕒", "🕓",
            "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛"
        ]
    },
    nature: {
        label: "🌸 Nature",
        emojis: [
            "💐", "🌸", "💮", "🏵️", "🌹", "🥀", "🌺", "🌻",
            "🌼", "🌷", "🌱", "🪴", "🌲", "🌳", "🌴", "🌵",
            "🌾", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🪹",
            "🪺", "🍄", "🌰", "🦀", "🌍", "🌎", "🌏", "🌐",
            "🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘",
            "🌙", "🌚", "🌛", "🌜", "☀️", "🌝", "🌞", "⭐",
            "🌟", "🌠", "☁️", "⛅", "⛈️", "🌤️", "🌥️", "🌦️",
            "🌧️", "🌨️", "🌩️", "🌪️", "🌫️", "🌬️", "🌀", "🌈",
            "🌂", "☂️", "☔", "⛱️", "⚡", "❄️", "☃️", "⛄",
            "☄️", "🔥", "💧", "🌊", "🎄", "✨", "🎋", "🎍"
        ]
    }
};

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

/**
 * RichTextEditor - A reusable rich text editor component with formatting and emoji support
 *
 * @param value - The HTML content value
 * @param onChange - Callback function when content changes
 * @param placeholder - Placeholder text when editor is empty
 * @param className - Additional CSS classes for the container
 */
export function RichTextEditor({
    value,
    onChange,
    placeholder = "Enter text...",
    className = ""
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [currentFontSize, setCurrentFontSize] = useState('3');
    const [activeEmojiTab, setActiveEmojiTab] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const applyFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const insertEmoji = (emoji: string) => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(emoji);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            // If no selection, append to the end
            if (editorRef.current) {
                editorRef.current.innerHTML += emoji;
            }
        }
        handleInput();
        setShowEmojiPicker(false);
        editorRef.current?.focus();
    };

    const applyColor = (color: string) => {
        applyFormat('foreColor', color);
        setShowColorPicker(false);
    };

    const applyFontSize = (size: string) => {
        setCurrentFontSize(size);
        applyFormat('fontSize', size);
    };

    const colors = [
        '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF',
        '#F3F3F3', '#FFFFFF', '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF',
        '#4A86E8', '#0000FF', '#9900FF', '#FF00FF', '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC',
        '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC'
    ];

    return (
        <div className={`border rounded-md overflow-hidden ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-muted border-b flex-wrap">
                {/* Font Size */}
                <Select value={currentFontSize} onValueChange={applyFontSize}>
                    <SelectTrigger className="h-8 w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">Small</SelectItem>
                        <SelectItem value="3">Normal</SelectItem>
                        <SelectItem value="5">Large</SelectItem>
                        <SelectItem value="7">Huge</SelectItem>
                    </SelectContent>
                </Select>

                <div className="w-px h-6 bg-border mx-1" />

                {/* Text Formatting */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('bold')}
                    className="h-8 w-8 p-0"
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('italic')}
                    className="h-8 w-8 p-0"
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('underline')}
                    className="h-8 w-8 p-0"
                    title="Underline"
                >
                    <Underline className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('strikeThrough')}
                    className="h-8 w-8 p-0"
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                {/* Headings */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('formatBlock', '<h1>')}
                    className="h-8 w-8 p-0"
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('formatBlock', '<h2>')}
                    className="h-8 w-8 p-0"
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                {/* Text Color */}
                <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Text Color"
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold">A</span>
                                <div className="w-4 h-1 bg-primary rounded" />
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                        <div className="grid grid-cols-10 gap-1">
                            {colors.map((color, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => applyColor(color)}
                                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                <div className="w-px h-6 bg-border mx-1" />

                {/* Lists */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('insertUnorderedList')}
                    className="h-8 w-8 p-0"
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('insertOrderedList')}
                    className="h-8 w-8 p-0"
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                {/* Text Alignment */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('justifyLeft')}
                    className="h-8 w-8 p-0"
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('justifyCenter')}
                    className="h-8 w-8 p-0"
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('justifyRight')}
                    className="h-8 w-8 p-0"
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                {/* Emoji Picker */}
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Insert Emoji"
                        >
                            <Smile className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 p-0">
                        {/* Emoji Category Tabs */}
                        <div className="flex border-b overflow-x-auto">
                            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveEmojiTab(key as keyof typeof EMOJI_CATEGORIES)}
                                    className={`flex-shrink-0 px-3 py-2 text-sm font-medium transition-colors ${
                                        activeEmojiTab === key
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>

                        {/* Emoji Grid - Scrollable */}
                        <div className="p-2 max-h-64 overflow-y-auto">
                            <div className="grid grid-cols-8 gap-1">
                                {EMOJI_CATEGORIES[activeEmojiTab].emojis.map((emoji, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => insertEmoji(emoji)}
                                        className="text-2xl hover:bg-muted rounded p-1 transition-colors"
                                        title={emoji}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="min-h-[100px] p-3 focus:outline-none focus:ring-0"
                data-placeholder={placeholder}
                style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                }}
            />

            <style>{`
                [contenteditable][data-placeholder]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
}

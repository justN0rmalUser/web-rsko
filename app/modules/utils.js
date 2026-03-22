export const ROWCELLS = `<tr $id>
    <td>
        <div class="word">$firm</div>
        <hr class="divider">
        <div class="word">$code</div>
    </td>
    <td>$count</td>
    <td>$price</td>
</tr>
`;


export function toIterable(obj) {
    if (!obj) return [];
    else return obj;
}
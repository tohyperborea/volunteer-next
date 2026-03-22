/**
 * Very simple divider
 * @since 2026-03-18
 * @author Michael Townsend <@continuities>
 */

interface Props {
  weight?:
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12'
    | 'a1'
    | 'a2'
    | 'a3'
    | 'a4'
    | 'a5'
    | 'a6'
    | 'a7'
    | 'a8'
    | 'a9'
    | 'a10'
    | 'a11'
    | 'a12';
}

export default function Divider({ weight = '6' }: Props) {
  return (
    <div
      style={{
        borderBottom: `1px solid var(--gray-${weight})`
      }}
    />
  );
}

/** Word wrappers preserve ordinary wrapping; each visible letter moves independently. */
const segmenter=new Intl.Segmenter(undefined,{granularity:'grapheme'});
export function PileText({text}:{text:string}){
  return <>{text.split(/(\s+)/).map((token,index)=>/\s/.test(token)?token:<span className="pile-token" key={index}>{[...segmenter.segment(token)].map(({segment},i)=><span className="pile-letter" key={i}>{segment}</span>)}</span>)}</>;
}

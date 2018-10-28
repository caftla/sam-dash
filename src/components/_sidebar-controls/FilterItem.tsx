import * as React from "react";
import { SimpleSelect } from '../common-controls/FormElementsUtils'
import R from "ramda";

interface IFilterItemProps<K> {
  filterKey: K;
  options: K[];
  value: string;
  onChange: (f: any) => void;
}

export default function FilterItem<K>(props: IFilterItemProps<K>) {
  return (
    <div className="filter-item">
      <SimpleSelect
        className="left"
        defaultValue={props.filterKey}
        value={props.filterKey}
        onValueChange={x => props.onChange(R.set(R.lensProp("filterKey"), x))}
        options={props.options}
      />
      <input
        className="right"
        value={props.value}
        onChange={ev =>
          props.onChange(R.set(R.lensProp("value"), ev.target.value))
        }
      />
    </div>
  );
}

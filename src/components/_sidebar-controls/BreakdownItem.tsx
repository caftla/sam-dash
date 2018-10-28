import * as React from "react";
import { SimpleSelect } from '../common-controls/FormElementsUtils'

import R from "ramda";

type Value = {
  value: string;
  label: string;
}

type IBreakdownItemProps = Value & {
  options: Value[];
  value: Value;
  onChange: (f: any) => void;
}

export default function BreakdownItem(props: IBreakdownItemProps) {
  return (
    <div className="breakdown-item">
      <SimpleSelect
        defaultValue={props.value}
        value={props.value}
        onValueChange={x => props.onChange(_ => x)}
        options={props.options}
        createFromSearch={(options, search) => 
          search.length > 1
          ? {label: search, value: search}
          : null
        }
      />
    </div>
  );
}

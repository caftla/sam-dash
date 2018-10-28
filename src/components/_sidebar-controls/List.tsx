import * as React from "react";
import * as R from "ramda";

export default class List<T> extends React.PureComponent<{
  items: T[];
  mkListItem: (t: T, onChange: (x: T) => void) => React.ComponentType;
  mkDefaultItem: () => T;
  onChange: (items: T[]) => void;
}> {
  render() {
    return (
      <div className={`list ${this.props.className || ''}`}>
        {this.props.items.map((t, i) => {
          return (
            <ListItem
              key={i.toString()}
              onClick={() => {
                this.props.onChange(
                      R.take(i)(this.props.items).concat(
                        R.drop(i + 1)(this.props.items) || []
                      )
                    )
              }}
            >
              {this.props.mkListItem(t, x => {
                this.props.onChange(
                  R.over(R.lensIndex(i), x, this.props.items)
                );
              })}
            </ListItem>
          );
        })}
          <div className="add"
            onClick={() =>
              this.props.onChange(
                this.props.items.concat([this.props.mkDefaultItem()])
              )
            }
          >
            +
          </div>
      </div>
    );
  }
}

const ListItem = ({ children, onClick, className }) => (
  <div className={`list-item ${className || ""}`}>
    {children}
    <div onClick={onClick} className="minus">-</div>
  </div>
);

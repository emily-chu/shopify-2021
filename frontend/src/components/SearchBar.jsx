import React from 'react';

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      query: ''
    };
  }

  handleChange(event) {
    this.setState({
      query: event.target.value
    }, ()=>this.props.changeCallback(this.state.query));
  }

  render() {
    return (
      <form>
        <input  id="search-bar" className="popin" type="text" value={this.state.query} onChange={this.handleChange} placeholder="Search by title"/>
      </form>
    );
  }
}
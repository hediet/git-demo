import "reflect-metadata";
import * as React from "react";
import * as ReactDom from "react-dom";
import { Container, injectable } from "inversify";
import {
	serviceId,
	withModel,
	ContainerProvider,
	IModel,
	inject,
	injectProps
} from "./helper";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import { Disposable } from "@hediet/std/disposable";
import "./services";

// gui2

class Test<T> extends React.Component<{ foo: T, children: (item: T) => void }> {

}

// TODO

const x = (<Inject id={"test"}>
	{Bar => Bar.Component}
</Inject>);


@injectable()
class UserComponentModel implements IModel {
	@observable public counter: number = 0;
	public readonly ref = React.createRef<HTMLButtonElement>();

	constructor(
		public @inject(UserImageComponentsId) userImageComponents: UserImageComponents,
		@injectProps()
		private readonly props: { uppercase: boolean } //@inject(userServiceId) //private readonly userService: typeof userServiceId.T
	) {
		/*this.dispose.track(
			startInterval(500, () => {
				this.counter++;
			})
		);*/
	}

	public readonly dispose = Disposable.fn();

	public componentDidMount() {
		this.ref.current!.focus();
	}

	@action.bound
	public handleClick() {
		this.counter++;
	}

	public get currentUser(): string {
		return "test";
		/*const usr = this.userService.currentUser;
		if (this.props.uppercase) {
			return usr.toUpperCase();
		}
		return usr;*/
	}
}

const UserComponent = withModel(
	UserComponentModel,
	observer(function UserComponent({ model }) {
		return (
			<div>
				Cur user: {model.currentUser}, {model.counter}
				<button ref={model.ref} onClick={model.handleClick}>
					test
				</button>
			</div>
		);
	})
);

/*const dev = false;
if (dev) {
	register(
		"sample1",
		<UserComponent.Wrapped
			model={{
				currentUser: "test",
				counter: 10,
				handleClick: () => undefined,
				ref: React.createRef()
			}}
		/>
	);
}*/

@observer
class Gui extends React.Component {
	private readonly container = new Container();

	constructor(props: {}) {
		super(props);

		//this.container.bind(userServiceId.id).to(UserService);
	}

	render() {
		return (
			<ContainerProvider value={this.container}>
				<UserComponent uppercase />
			</ContainerProvider>
		);
	}
}

const main = document.createElement("div");
document.body.append(main);
ReactDom.render(<Gui />, main);

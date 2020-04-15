// test
import { injectable, Container } from "inversify";
import { serviceId, inject, TypedId } from "./helper";
import { Disposable, dispose } from "@hediet/std/disposable";
import { EventEmitter } from "@hediet/std/events";

function getCachedSingletons(container: Container): unknown[] {
	const c = container as any;
	const result = new Array<unknown>();
	for (const v of c._bindingDictionary._map.values()) {
		for (const binding of v) {
			const cached = binding.cache as unknown;
			if (cached) {
				result.push(cached);
			}
		}
	}
	return result;
}

interface IUserService {
	currentUser: string | undefined;
}

@injectable()
class UserService implements IUserService {
	constructor() {
		console.log("UserService constructed");
	}

	get currentUser(): string | undefined {
		return "test";
	}
}

@injectable()
class AuthSystem {
	public onBeforeLogin = new EventEmitter();

	constructor() {
		console.log("AuthSystem constructed");
	}
}

@injectable()
class Client {
	constructor() {
		console.log("Client constructed");
	}

	public sendRequest(request: string): void {}

	dispose() {
		console.log("client disposed");
	}
}

@injectable()
class OnlineService implements Disposable {
	public dispose = Disposable.fn();

	constructor(
		@inject(clientId) private readonly client: Client,
		@inject(authSystemId) private readonly authSystem: AuthSystem
	) {
		console.log("OnlineService constructed");
		client.sendRequest("ping");

		this.dispose.track({
			dispose: () => {
				console.log("Dispose online service");
			}
		});

		this.dispose.track(
			authSystem.onBeforeLogin.sub(() => {
				client.sendRequest("offline");
			})
		);
	}
}

const c = new Container();
c.bind(userServiceId.id)
	.to(UserService)
	.inSingletonScope();
c.bind(authSystemId.id)
	.to(AuthSystem)
	.inSingletonScope();

function testLogin() {
	const c2 = new Container();
	c2.parent = c;
	c2.bind(clientId.id)
		.to(Client)
		.inSingletonScope();
	c2.bind("Autostart").toService(clientId.id);

	c2.bind(onlineServiceId.id)
		.to(OnlineService)
		.inSingletonScope();
	c2.bind("Autostart").toService(onlineServiceId.id);

	c2.getAll("Autostart");

	const cachedInstances = getCachedSingletons(c2);
	for (const c of cachedInstances) {
		const c2 = c as any;
		if ("dispose" in c2) {
			c2.dispose();
		}
	}
	c2.unbindAll();
}

testLogin();
testLogin();

interface ScopedContainer {
	bind<T>(id: TypedId<T>): To<T>;
}

interface To<T> {
	toSingleton(impl: new (...args: any[]) => T): Options;
}

interface Options {
	autostart(): this;
}

interface RegisterContext {
	globalContainer: ScopedContainer;
	registerLoginServices(callback: (ct: ScopedContainer) => void): void;
}

class Module {
	constructor(args: {
		dependencies: Module[];
		register: (ctx: RegisterContext) => Promise<void>;
	}) {}
}

/*

<Load module={rootModule}>
    {() =>
        <GetService serviceId={chatroomViewId}>
            {Module => <Module.ChatroomView />}
        </GetService>
    }
</Load>

*/

class RootModuleService {}

const userServiceId = serviceId<IUserService>("UserService");
const authSystemId = serviceId<AuthSystem>("AuthSystem");
const clientId = serviceId<Client>("Client");
const onlineServiceId = serviceId<OnlineService>("OnlineService");

const rootModule = new Module({
	dependencies: [],
	exports: {},
	register: async ctx => {
		const index = await import("../index");

		ctx.registerLoginServices(container => {
			container
				.bind(onlineServiceId)
				.toSingleton(index.OnlineService)
				.autostart();
		});
	}
});

const chatModule = new Module({
	dependencies: [rootModule],
	modalServices: [myModalServiceId],
	register: async ctx => {
		const index = await import("../index");
		ctx.registerLoginServices(container => {
			container
				.bind(onlineServiceId)
				.toSingleton(OnlineService)
				.autostart();
		});
	}
});

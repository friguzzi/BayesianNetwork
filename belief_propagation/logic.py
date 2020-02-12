import numpy as np


class Node:
    def __init__(self, name):
        self.name = name
        self.mailbox = {}
        self.connections = []

    def append(self, dest_node):
        self.connections.append(dest_node)
        dest_node.connections.append(self)

    def propagate(self, step_number, mu):
        if not self.mailbox.get(step_number):
            self.mailbox[step_number] = [mu]
        else:
            self.mailbox[step_number].append(mu)


class Variable(Node):
    def __init__(self, name, size):
        Node.__init__(self, name)
        self.bfmarginal = None
        self.size = size

    def marginal(self):
        if len(self.mailbox):
            mus = self.mailbox[max(self.mailbox.keys())]
            log_vals = [np.log(mu.value) for mu in mus]
            valid_log_vals = [np.nan_to_num(log_val) for log_val in log_vals]
            valid_logs_sum = sum(valid_log_vals) - max(sum(valid_log_vals))
            res = np.exp(valid_logs_sum)
            return res / sum(res)
        else:
            return np.ones(self.size) / self.size

    def create_message(self, dest):
        if not len(self.connections) == 1:
            mus_not_filtered = self.mailbox[max(self.mailbox.keys())]
            mus = [mu for mu in mus_not_filtered if not mu.source_node == dest]
            return np.exp(sum([np.log(mu.value) for mu in mus]))
        else:
            return np.ones(self.size)


class Factor(Node):
    def __init__(self, name, potentials):
        Node.__init__(self, name)
        self.potential = potentials

    def reshape_mu(self, mu):
        dims = self.potential.shape
        accumulator = np.ones(dims)
        for coordinate in np.ndindex(dims):
            c = coordinate[self.connections.index(mu.source_node)]
            accumulator[coordinate] *= mu.value[c]
        return accumulator

    def sum(self, potential, node):
        res = np.zeros(node.size)
        for coordinate in np.ndindex(potential.shape):
            c = coordinate[self.connections.index(node)]
            res[c] += potential[coordinate]
        return res

    def create_message(self, dest):
        if not len(self.connections) == 1:
            mus_not_filtered = self.mailbox[max(self.mailbox.keys())]
            mus = [mu for mu in mus_not_filtered if not mu.source_node == dest]
            all_mus = [self.reshape_mu(mu) for mu in mus]
            lambdas = np.array([np.log(mu) for mu in all_mus])
            max_lambdas = np.nan_to_num(lambdas.flatten())
            res = sum(lambdas) - max(max_lambdas)
            product_output = np.multiply(self.potential, np.exp(res))
            return np.exp(
                np.log(self.sum(product_output, dest)) + max(max_lambdas))
        else:
            return self.sum(self.potential, dest)


class Mu:
    def __init__(self, source_node, value):
        self.source_node = source_node
        val_flat = value.flatten()
        self.value = val_flat / sum(val_flat)


class FactorGraph:
    def __init__(self, first_node=None):
        self.nodes = {}
        if first_node:
            self.nodes[first_node.name] = first_node

    def calculate_marginals(self, max_iterations=1000, tol=1e-5):
        step = 0
        epsilons = [1]
        for node in self.nodes.values():
            node.mailbox.clear()
        cur_marginals = self.get_marginals()
        for node in self.nodes.values():
            if isinstance(node, Variable):
                message = Mu(node, np.ones(node.size))
                for dest in node.connections:
                    dest.propagate(step, message)

        while (step < max_iterations) and tol < epsilons[-1]:
            step += 1
            last_marginals = cur_marginals
            vars = [node for node in self.nodes.values() if isinstance(node, Variable)]
            fs = [node for node in self.nodes.values() if isinstance(node, Factor)]
            senders = fs + vars
            for sender in senders:
                next_dests = sender.connections
                for dest in next_dests:
                    value = sender.create_message(dest)
                    msg = Mu(sender, value)
                    dest.propagate(step, msg)
            cur_marginals = self.get_marginals()
            epsilons.append(self.confront_marginals(cur_marginals, last_marginals))
        return epsilons[1:]

    @staticmethod
    def confront_marginals(marginal_1, marginal_2):
        return sum([sum(np.absolute(marginal_1[k] - marginal_2[k])) for k in marginal_1.keys()])

    def add(self, node):
        self.nodes[node.name] = node

    def append(self, source_node_name, dest_node):
        dnn = dest_node.name
        if not (self.nodes.get(dnn, 0)):
            self.nodes[dnn] = dest_node
        self.nodes[source_node_name].append(self.nodes[dnn])
        return self

    def connect(self, name1, name2):
        self.nodes[name1].append(self.nodes[name2])

    def set_evidence(self, name, state):
        nd = self.nodes[name]
        for f in [conn for conn in nd.connections if isinstance(conn, Factor)]:
            del_ax = f.connections.index(nd)
            del_dims = list(range(nd.size))
            del_dims.pop(state - 1)
            sl = np.delete(f.potential, del_dims, del_ax)
            f.potential = np.squeeze(sl)
            f.connections.remove(nd)
        nd.connections = []

    def get_marginals(self):
        return dict([
            (n.name, n.marginal()) for n in self.nodes.values()
            if isinstance(n, Variable)
        ])
